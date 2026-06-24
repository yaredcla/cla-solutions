

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const keywords = [
  "Website Development Ethiopia",
  "Web Design Ethiopia",
  "Software Development Ethiopia",
  "Web Development East Africa",
  "Digital Solutions Ethiopia",
  "Business Website Ethiopia"
];


export const metadata = {
  metadataBase: new URL("https://clasolutions.africa"),
  title: {
    default: "CLA Solutions | Website Development Ethiopia & East Africa",
    template: "%s | CLA Solutions"
  },
  description:
    "CLA Solutions helps Ethiopian and East African businesses grow through premium websites, web applications, e-commerce, SEO, and digital transformation.",
  keywords,
  authors: [{ name: "CLA Solutions" }],
  creator: "CLA Solutions",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  },
  openGraph: {
    title: "CLA Solutions | Digital Innovation for African Businesses",
    description:
      "Professional websites, web apps, e-commerce, SEO, and support for Ethiopia and East Africa.",
    url: "https://clasolutions.africa",
    siteName: "CLA Solutions",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "CLA Solutions",
    description: "Professional websites that grow your business."
  },
  robots: {
    index: true,
    follow: true
  }
} satisfies Metadata;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CLA Solutions",
    url: "https://clasolutions.africa",
    email: "hello@clasolutions.africa",
    areaServed: ["Ethiopia", "East Africa"],
    slogan: "Transforming African Businesses Through Digital Innovation",
    serviceType: [
      "Website Development",
      "E-Commerce Solutions",
      "Web Applications",
      "UI/UX Design",
      "SEO Optimization",
      "Maintenance and Support"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
