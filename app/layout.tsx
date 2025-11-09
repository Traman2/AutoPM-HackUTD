import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Geist, Geist_Mono } from 'next/font/google'
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth0 Next.js App",
  description: "Next.js app with Auth0 authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}