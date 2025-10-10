import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import HowItWorks from "@/components/HowItWorks";
import EventFeed from "@/components/EventFeed";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { Sparkles, Users, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      <section className="py-16" id="features">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Choose Vibe?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience a new way to build meaningful connections
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Sparkles}
                title="AI-Powered Matching"
                description="Our algorithm analyzes your vibe profile to connect you with compatible people and events that match your energy."
              />
              <FeatureCard
                icon={Users}
                title="Perfect Group Size"
                description="Small groups of 5-10 people create intimate, meaningful connections without the overwhelm of large gatherings."
              />
              <FeatureCard
                icon={Shield}
                title="Safe & Verified"
                description="All members are verified and events are hosted by trained facilitators in welcoming, inclusive spaces."
              />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <EventFeed />
      <CTASection />
      <Footer />
    </div>
  );
}
