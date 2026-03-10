import Footer from "../../../shared/ui/Footer/Footer";
import TopBar from "../../../shared/ui/Navbars/TopBar";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";
import FeaturesSection from "../sections/FeaturesSection";
import HeroSection from "../sections/HeroSection";
import PricingSection from "../sections/PricingSection";
import ShowcaseSection from "../sections/ShowcaseSection";

export default function LandingPage() {
  return (
    <div>
      <TopBar />
      <main className="bg-transparent">
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <PricingSection />
      </main>
      <Footer embedded />

      <FloatingInstallDownloadButtons />
    </div>
  );
}
