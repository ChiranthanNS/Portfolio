import type { Metadata } from "next";
import { Manrope, Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";
import { Toaster } from "../components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { profile } from "../content/profile";
import { siteDescription, siteUrl } from "../lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-heading",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chiranthan N S — AI/ML Engineer",
    template: "%s · Chiranthan N S",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Chiranthan N S",
    title: "Chiranthan N S — AI/ML Engineer",
    description: siteDescription,
    images: [
      {
        url: "/images/profile.jpg",
        width: 1200,
        height: 1600,
        alt: "Chiranthan N S",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chiranthan N S — AI/ML Engineer",
    description: siteDescription,
    images: ["/images/profile.jpg"],
    creator: "@n_chiranth8732",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.fullName,
  url: siteUrl,
  email: profile.email,
  image: `${siteUrl}/images/profile.jpg`,
  jobTitle: "AI/ML Engineering Student",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Vidyavardhaka College of Engineering",
    address: "Mysuru, Karnataka, India",
  },
  sameAs: [profile.githubUrl, profile.linkedinUrl, profile.xUrl].filter(
    Boolean,
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${mono.variable} ${serif.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
