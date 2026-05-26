import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Links Property Network | Trusted Real Estate in Uganda",
  description:
    "A private, high-trust ecosystem connecting serious property buyers with pre-screened agents. Title verification, legal documentation, and brokerage services.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <div style={{ paddingBottom: "70px" }}>
          {children}
        </div>
        <InstallPrompt />
        <BottomNav />
      </body>
    </html>
  );
}
