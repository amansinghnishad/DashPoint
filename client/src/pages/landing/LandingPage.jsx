import TopBar from "../../components/Navbars/TopBar";
import Footer from "../../components/Footer";
import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import ShowcaseSection from "./sections/ShowcaseSection";
import PricingSection from "./sections/PricingSection";
import FloatingInstallDownloadButtons from "../../components/PWAStatus/FloatingInstallDownloadButtons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <PricingSection />
      </main>
      <Footer />

      <FloatingInstallDownloadButtons />
    </div>
  );
}
