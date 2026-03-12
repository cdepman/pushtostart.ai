import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipArtifact — Build in Claude. Ship to the world.",
  description:
    "Deploy your Claude artifacts as live websites in seconds. Paste your code, get a URL. No config, no setup.",
  openGraph: {
    title: "ShipArtifact",
    description: "Deploy your Claude artifacts as live websites in seconds.",
    url: "https://shipartifact.com",
    siteName: "ShipArtifact",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#13151d",
          colorText: "#e2e4e9",
          colorTextSecondary: "#9ca3af",
          colorPrimary: "#6366f1",
          colorInputBackground: "#1a1d27",
          colorInputText: "#e2e4e9",
          colorNeutral: "#e2e4e9",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-[#13151d] border border-[rgba(255,255,255,0.08)] shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-[#9ca3af]",
          formFieldLabel: "text-[#9ca3af]",
          formButtonPrimary: "bg-[#6366f1] hover:bg-[#5558e6]",
          footerAction: "text-[#9ca3af]",
          footerActionLink: "text-[#6366f1] hover:text-[#818cf8]",
          dividerLine: "bg-[rgba(255,255,255,0.08)]",
          dividerText: "text-[#6b7280]",
          socialButtonsBlockButton:
            "border-[rgba(255,255,255,0.1)] bg-[#1a1d27] text-[#e2e4e9] hover:bg-[#242736]",
          formFieldInput:
            "bg-[#1a1d27] border-[rgba(255,255,255,0.1)] text-[#e2e4e9]",
          identityPreview: "bg-[#1a1d27] border-[rgba(255,255,255,0.1)]",
          identityPreviewText: "text-[#e2e4e9]",
          identityPreviewEditButton: "text-[#6366f1]",
        },
      }}
    >
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
