import TopBar from "../components/TopBar";
import HeroSection from "../components/HeroSection";
import FeatureCards from "../components/FeatureCards";
import ProofGallery from "../components/ProofGallery";
import HowItWorks from "../components/HowItWorks";
import EscrowTrustSeal from "../components/EscrowTrustSeal";
import LaunchBanner from "../components/LaunchBanner";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface antialiased selection:bg-primary selection:text-on-primary min-h-screen flex flex-col justify-start items-center">
      <main className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex flex-col w-full pb-16 gap-8 sm:gap-12 lg:gap-14">
          <TopBar />
          <HeroSection />
          <div
            className="w-full h-3 bg-[radial-gradient(#1a1c1c_1px,transparent_1px)] [background-size:10px_10px] opacity-15"
            aria-hidden="true"
          />
          <FeatureCards />
          <ProofGallery />
          <HowItWorks />
          <EscrowTrustSeal />
          <LaunchBanner />
          <Footer />
        </div>
      </main>
    </div>
  );
}
