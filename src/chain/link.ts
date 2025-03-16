import {
  createPublicClient,
  encodeFunctionData,
  Hex,
  http,
  parseUnits,
  createWalletClient,
  encodeAbiParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";
import { keccak256, toHex } from "viem/utils";

// Constants
export const OP_RPC_URL = "https://mainnet.optimism.io";
export const OP_CHAIN_ID = 10; // Optimism mainnet
export const OP_DAI_ADDRESS = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
export const DAI_DECIMALS = 18;
export const PEANUT_CONTRACT = "0xb75B6e4007795e84a0f9Db97EB19C6Fc13c84A5E"; // Optimism, Peanut v4.3
export const DEPOSIT_EVENT_SIG =
  "0x6cfb6f205ed755f233c83bfe7f03aee5e1d993139ce47aead6d4fe25f7ec3066" as const;
export const PEANUT_SALT =
  "0xa7f5f920025df92f95662ccfb788a1d2d21b4525aae814a71591e2754be55beb";

export interface LinkCall {
  address: Hex;
  calldata: Hex;
  password: string;
}

// ABI snippets
const peanutAbi = [
  {
    inputs: [
      { name: "_tokenAddress", type: "address" },
      { name: "_contractType", type: "uint8" },
      { name: "_amount", type: "uint256" },
      { name: "_tokenId", type: "uint256" },
      { name: "_pubKey20", type: "address" },
    ],
    name: "makeDeposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_index", type: "uint256" },
      { name: "_recipientAddress", type: "address" },
      { name: "_signature", type: "bytes" },
    ],
    name: "withdrawDeposit",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_index", type: "uint256" },
      { indexed: true, name: "_contractType", type: "uint8" },
      { indexed: false, name: "_amount", type: "uint256" },
      { indexed: true, name: "_senderAddress", type: "address" },
    ],
    name: "DepositEvent",
    type: "event",
  },
];

// Setup transport and clients
const transport = http(OP_RPC_URL);
const publicClient = createPublicClient({ chain: optimism, transport });

export async function createLinkCall({
  usd,
}: {
  usd: number;
}): Promise<LinkCall> {
  // Generate password and hash
  const password = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const privateKey = keccak256(toHex(password));
  const keyAccount = privateKeyToAccount(privateKey);
  console.log(`PAY: generated key: ${keyAccount.address}`);

  // Convert amount to wei
  const amountWei = parseUnits(usd.toString(), DAI_DECIMALS);
  console.log(`PAY: amount converted to wei: ${amountWei}`);

  // Make deposit
  const address = PEANUT_CONTRACT as Hex;
  const calldata = encodeFunctionData({
    abi: peanutAbi,
    functionName: "makeDeposit",
    args: [
      OP_DAI_ADDRESS,
      1, // ERC-20
      amountWei,
      0, // always 0 when using ERC-20
      keyAccount.address,
    ],
  });

  return { address, calldata, password };
}

export async function getLinkFromDeposit({
  txHash,
  password,
}: {
  txHash: Hex;
  password: string;
}) {
  // Get receipt
  const depositReceipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });
  if (depositReceipt.status !== "success") {
    throw new Error(`deposit failed: ${txHash}`);
  }
  console.log(`PAY: deposit made. transaction receipt: ${txHash}`);

  // Get deposit index from logs
  const logs = await publicClient.getLogs({
    address: PEANUT_CONTRACT as `0x${string}`,
    fromBlock: depositReceipt.blockNumber,
    toBlock: depositReceipt.blockNumber,
  });

  // Find the Deposit event log by matching the event signature in the first topic
  const depositLog = logs.find(
    (log) => log.topics && log.topics[0] === DEPOSIT_EVENT_SIG
  );

  if (!depositLog || !depositLog.topics || depositLog.topics.length < 2) {
    throw new Error("deposit event not found in transaction logs");
  }

  const depositIdx = Number(depositLog.topics[1]);
  console.log(`PAY: found deposit index: ${depositIdx}`);

  // Create link
  const host = process.env.NEXT_PUBLIC_HOST || 'https://surprise-envelope.vercel.app';
  const link = `${host}/claim?c=${OP_CHAIN_ID}&v=v4.3&i=${depositIdx}#p=${password}`;
  console.log(`PAY: claim link created: ${link}`);

  return link;
}

export async function createClaimTx({
  index,
  password,
  recipientAddress,
}: {
  index: number;
  password: string;
  recipientAddress: Hex;
}): Promise<{ calldata: Hex; address: Hex }> {
  // Recreate the private key from the password
  const privateKey = keccak256(toHex(password));
  const keyAccount = privateKeyToAccount(privateKey);

  // Generate the message hash according to Peanut's verification logic
  const messageHash = keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "uint256" },
        { type: "address" },
        { type: "uint256" },
        { type: "address" },
        { type: "bytes" },
      ],
      [
        PEANUT_SALT as Hex,
        BigInt(OP_CHAIN_ID),
        PEANUT_CONTRACT as Hex,
        BigInt(index),
        recipientAddress,
        "0x", // empty extraData
      ]
    )
  );

  // Create wallet client for signing
  const walletClient = createWalletClient({
    account: keyAccount,
    chain: optimism,
    transport,
  });

  // Sign the message
  const signature = await walletClient.signMessage({
    message: { raw: messageHash },
  });

  // Create transaction calldata
  const calldata = encodeFunctionData({
    abi: peanutAbi,
    functionName: "withdrawDeposit",
    args: [BigInt(index), recipientAddress, signature as Hex],
  });

  return {
    calldata,
    address: PEANUT_CONTRACT as Hex,
  };
}

export function parsePeanutLink(url: string): {
  chainId: number;
  index: number;
  password: string;
} | null {
  try {
    const parsedUrl = new URL(url);

    // Extract query parameters
    const chainId = Number(parsedUrl.searchParams.get("c"));
    const index = Number(parsedUrl.searchParams.get("i"));

    // Extract password from hash part (#p=password)
    const hashParts = parsedUrl.hash.substring(1).split("=");
    const password = hashParts.length > 1 ? hashParts[1] : "";

    if (!chainId || isNaN(chainId) || !index || isNaN(index) || !password) {
      return null;
    }

    return { chainId, index, password };
  } catch (e) {
    console.error("failed to parse peanut link:", e);
    return null;
  }
}
