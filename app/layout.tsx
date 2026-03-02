import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import GlobalLayoutWrapper from "../components/GlobalLayoutWrapper";
import WhatsAppFAB from "../components/WhatsAppFAB";
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'EducationalOrganization'],
              name: 'SIFL - Professional Language Institute',
              url: 'https://sifl.edu.in',
              logo: 'https://sifl.edu.in/images/hero/logo.jpg',
              description: 'Professional Language Training Institute specializing in German, French, English and IELTS for Study Abroad and Corporate careers.',
            })
          }}
        />
      </head>
      <body
        className={`${publicSans.className} bg-[#f6f8f6] text-slate-900 antialiased`}
      >
        <div className="max-md:min-h-[100dvh] max-md:overflow-x-hidden max-md:bg-gradient-to-b max-md:from-slate-50 max-md:to-white max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] max-md:px-4">
          <GlobalLayoutWrapper>{children}</GlobalLayoutWrapper>
          <WhatsAppFAB />
        </div>
      </body>
    </html>
  );
}