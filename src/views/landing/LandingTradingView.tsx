import { Helmet } from "react-helmet-async";
import TradingHero from "../../components/landing/TradingHero";
import MarketHighlights from "../../components/landing/MarketHighlights";
import MarketsTable from "../../components/landing/MarketsTable";
import TradingTools from "../../components/landing/TradingTools";
import CTASection from "../../components/landing/CTASection";

export default function LandingTradingView() {
  return (
    <>
      <Helmet>
        <title>Trading | novaFi</title>
        <meta
          name="description"
          content="Trade spot, perpetuals, and futures on novaFi with deep liquidity and advanced order types."
        />
      </Helmet>
      <TradingHero />
      <MarketHighlights />
      <MarketsTable />
      <TradingTools />
      <CTASection
        heading="Your next trade starts here"
        description="Open an account and get instant access to every market on novaFi."
        primaryLabel="Start trading"
        primaryHref="/login"
      />
    </>
  );
}
