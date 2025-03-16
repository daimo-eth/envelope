import {
  createPublicClient,
  encodeFunctionData,
  Hex,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";
import { keccak256, toHex } from "viem/utils";

// Constants
const RPC_URL = "https://mainnet.optimism.io";
const CHAIN_ID = 10; // Optimism mainnet
const DAI_ADDRESS = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
const DAI_DECIMALS = 18;
const PEANUT_CONTRACT = "0xb75B6e4007795e84a0f9Db97EB19C6Fc13c84A5E"; // Optimism, Peanut v4.3

// ABI snippets
const peanutAbi = [
  {
    inputs: [
      { name: "_tokenAddress", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_pubKey20", type: "address" },
      { name: "_contractType", type: "uint8" },
    ],
    name: "makeDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Setup transport and clients
const transport = http(RPC_URL);
const publicClient = createPublicClient({ chain: optimism, transport });

export async function createLinkCall({
  usd,
}: {
  usd: number;
}): Promise<{ address: Hex; calldata: Hex; password: string }> {
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
    args: [DAI_ADDRESS, amountWei, keyAccount.address, 0], // 0 = ERC20
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

  // Assuming the second log is the DepositEvent
  const depositIdx = Number(logs[1].topics[1]);

  // Create link
  const link = `https://peanut.to/claim?c=${CHAIN_ID}&v=v4.3&i=${depositIdx}#p=${password}`;
  console.log(`PAY: peanut claim link created: ${link}`);

  return link;
}
