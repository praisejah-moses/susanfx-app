import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import BrandsSection from "../components/home/BrandsSection";
import AccountsSection from "../components/home/AccountsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import FeaturesSection from "../components/home/FeaturesSection";
import PlatformSection from "../components/home/PlatformSection";
import CountriesSection from "../components/home/CountriesSection";
import SupportSection from "../components/home/SupportSection";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BrandsSection />
        <AccountsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlatformSection />
        <CountriesSection />
        <SupportSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
