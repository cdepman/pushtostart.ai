import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "PushToStart — Create in Claude. Share with the world.",
  description:
    "Turn your Claude creations into live websites in seconds. Paste, preview, publish. No technical skills needed.",
  openGraph: {
    title: "PushToStart",
    description: "Turn your Claude creations into live websites in seconds.",
    url: "https://pushtostart.ai",
    siteName: "PushToStart",
    type: "website",
    images: [
      {
        url: "https://pushtostart.ai/og.png",
        width: 1200,
        height: 630,
        alt: "PushToStart — Create in Claude. Share with the world.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PushToStart",
    description: "Turn your Claude creations into live websites in seconds.",
    images: ["https://pushtostart.ai/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Nunito:wght@700;800&family=Space+Mono:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
