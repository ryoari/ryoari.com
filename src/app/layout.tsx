import type { Metadata } from "next";
import identity from "@/data/identity.json";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: `${identity.name} - ${identity.tagline}`,
  description: identity.bio,
  openGraph: {
    title: identity.name,
    description: identity.bio,
    url: identity.website,
    siteName: identity.name,
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: identity.name,
    description: identity.bio,
    creator: identity.socials.find((s) => s.platform === "Twitter")?.username,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    url: identity.website,
    sameAs: identity.socials.map((s) => s.url),
    jobTitle: identity.tagline,
    description: identity.bio,
    email: identity.email,
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
