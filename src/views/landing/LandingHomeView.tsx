import { Helmet } from "react-helmet-async";
import Hero from "../../components/landing/Hero";
import HomeFeatures from "../../components/landing/HomeFeatures";
import SecuritySection from "../../components/landing/SecuritySection";
import FAQSection from "../../components/landing/FAQSection";
import CTASection from "../../components/landing/CTASection";

export default function LandingHomeView() {
  return (
    <>
      <Helmet>
        <title>Home | novaFi</title>
        <meta
          name="description"
          content="novaFi is a fast, secure trading platform for spot and derivatives markets."
        />
      </Helmet>
      <Hero />
      <HomeFeatures />
      <SecuritySection />
      <FAQSection />
      <CTASection
        heading="Ready to start trading?"
        description="Create your account in minutes and get access to 180+ markets with institutional-grade tools."
        primaryLabel="Start trading"
        primaryHref="/login"
      />
    </>
  );
}
