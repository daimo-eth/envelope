import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Surprise Envelope",
  description: "Send a surprise envelope to your loved ones",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
