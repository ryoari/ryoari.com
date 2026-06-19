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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
