import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/marketing/HeroSection";
import FounderInsightSection from "@/components/marketing/FounderInsightSection";
import ReframeSection from "@/components/marketing/ReframeSection";
import ProductIntroSection from "@/components/marketing/ProductIntroSection";
import PlatformPreviewSection from "@/components/marketing/PlatformPreviewSection";
import StudioToolsSection from "@/components/marketing/StudioToolsSection";
import PlatformFrameworkSection from "@/components/marketing/PlatformFrameworkSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import HomePricingSection from "@/components/marketing/HomePricingSection";
import LeadMagnetSection from "@/components/marketing/LeadMagnetSection";
import FinalCTASection from "@/components/marketing/FinalCTASection";

export default function Homepage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Product Nerve AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://productnerve.com",
    description:
      "Product Nerve AI is a venture operating system that helps founders validate ideas, design execution systems, and make smart decisions to scale, pivot, or kill products.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
      { "@type": "Offer", price: "11.99", priceCurrency: "USD", name: "Project Unlock" },
      { "@type": "Offer", price: "9.75", priceCurrency: "USD", name: "Pro Monthly" },
    ],
    creator: {
      "@type": "Organization",
      name: "Product Nerve AI",
      url: "https://productnerve.com",
    },
  };

  return (
    <div>
      <Helmet>
        <title>Product Nerve AI — Venture Operating System for Founders</title>
        <meta
          name="description"
          content="Product Nerve AI helps founders validate ideas, design execution plans, and build growth strategies before launching their startups."
        />
        <link rel="canonical" href="https://productnerve.com" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <HeroSection />
      <FounderInsightSection />
      <ReframeSection />
      <ProductIntroSection />
      <PlatformPreviewSection />
      <StudioToolsSection />
      <PlatformFrameworkSection />
      <SocialProofSection />
      {/* <HomePricingSection /> */}
      <LeadMagnetSection />
      <FinalCTASection />
    </div>
  );
}
