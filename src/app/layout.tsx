import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: APP_NAME,
        template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    keywords: ["social media", "connect", "messaging", "posts", "community"],
    authors: [{ name: APP_NAME }],
    creator: APP_NAME,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="antialiased">{children}</body>
        </html>
    );
}
