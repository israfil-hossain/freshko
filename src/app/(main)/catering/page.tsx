import CateringHero from "@/components/CateringHero";
import CateringTrustBar from "@/components/CateringTrustBar";
import CateringServices from "@/components/CateringServices";
import CateringMenu from "@/components/CateringMenu";
import CateringHowItWorks from "@/components/CateringHowItWorks";
import CateringTestimonials from "@/components/CateringTestimonials";
import CateringFooter from "@/components/CateringFooter";

export default function CateringLandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <CateringHero />
      <CateringTrustBar />
      <CateringServices />
      <CateringMenu />
      <CateringHowItWorks />
      <CateringTestimonials />
      <CateringFooter />
    </main>
  );
}
