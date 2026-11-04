import { Helmet } from "react-helmet-async";
import AboutHero from "../../components/landing/AboutHero";
import AboutValues from "../../components/landing/AboutValues";
import AboutStory from "../../components/landing/AboutStory";
import CTASection from "../../components/landing/CTASection";

export default function LandingAboutView() {
  return (
    <>
      <Helmet>
        <title>About | novaFi</title>
        <meta
          name="description"
          content="Learn about novaFi's mission to make institutional-grade trading tools accessible to everyone."
        />
      </Helmet>
      <AboutHero />
      <AboutValues />
      <AboutStory />
      <CTASection
        heading="Join us on the journey"
        description="We're always looking for talented people who share our mission. Explore open roles or just say hello."
        primaryLabel="Get in Touch"
        primaryHref="mailto:hello@novafi.io"
      />
    </>
  );
}
