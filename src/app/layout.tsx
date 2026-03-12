import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipArtifact — Build in Chat. Ship to the world.",
  description:
    "Launch your Claude artifacts as live websites in seconds. Paste your code, get a URL. No config, no setup.",
  openGraph: {
    title: "ShipArtifact",
    description: "Launch your Claude artifacts as live websites in seconds.",
    url: "https://shipartifact.com",
    siteName: "ShipArtifact",
    type: "website",
    images: [
      {
        url: "https://shipartifact.com/api/og",
        width: 1200,
        height: 630,
        alt: "ShipArtifact — Build in Chat. Ship to the world.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShipArtifact",
    description: "Launch your Claude artifacts as live websites in seconds.",
    images: ["https://shipartifact.com/api/og"],
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
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
