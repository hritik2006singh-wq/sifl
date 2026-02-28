import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SIFL | Professional Language Institute",
  description: "Professional Language Training Institute",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${publicSans.className} bg-[#f6f8f6] text-slate-900 antialiased`}
      >
        <Navbar />

        {/* Push page below fixed navbar */}
        <main>
          {children}
        </main>

        <Footer />
        <LeadCapture />
      </body>
    </html>
  );
}