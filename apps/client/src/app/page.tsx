import { auth } from "@/auth";
import { BlogSection } from "@/components/landing/BlogSection";
import { ClientSections } from "@/components/landing/ClientSections";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { SubscriptionTiers } from "@/components/landing/SubscriptionTiers";

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userEmail = session?.user?.email;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header isLoggedIn={isLoggedIn} userEmail={userEmail || undefined} />

      {/* Hero Section */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Client-side sections (Pet Types, Video, Newsletter) */}
      <ClientSections />

      {/* Services Section */}
      <ServicesSection />

      {/* Subscription Tiers */}
      <SubscriptionTiers />

      {/* Blog Section */}
      <BlogSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
