"use client";

import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { FeaturesSection } from "@/components/LandingPage/FeaturesSection";
import { StatsSection } from "@/components/LandingPage/StatsSection";
import { TestimonialsSection } from "@/components/LandingPage/TestimonialsSection";
import { CTASection } from "@/components/LandingPage/CTASection";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-x-hidden">
      <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
      <div id="features">
        <FeaturesSection />
      </div>
      <StatsSection />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGetStarted} />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Enterprise EMS</h3>
              <p className="text-sm text-slate-400">
                Modern employee management system for forward-thinking organizations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-white cursor-pointer transition-colors">Security</li>
                <li className="hover:text-white cursor-pointer transition-colors">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">About</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms</li>
                <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Licenses</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Enterprise EMS. All rights reserved. Built with Next.js & FastAPI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
