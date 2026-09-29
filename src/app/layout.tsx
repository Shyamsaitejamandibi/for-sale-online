import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "For Sale — Good company. Great deals.",
  description:
    "Your next game night, sorted. A warm, social game of buying low, selling high, and reading your friends. Play For Sale with 3–6 players or practice with bots.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>
        <a className="skip-link" href="#table">
          Skip to the game
        </a>
        {children}
      </body>
    </html>
  );
}
