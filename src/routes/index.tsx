import { createFileRoute } from "@tanstack/react-router";
import { site } from "../../config/site";
import { EmergencyStrip } from "../components/sections/EmergencyStrip";
import { Header } from "../components/sections/Header";
import { Hero } from "../components/sections/Hero";
import { Marquee } from "../components/sections/Marquee";
import { Services } from "../components/sections/Services";
import { BeforeAfterSection } from "../components/sections/BeforeAfter";
import { Tracker } from "../components/sections/Tracker";
import { ServiceArea } from "../components/sections/ServiceArea";
import { Financing, Reviews } from "../components/sections/Financing";
import { EstimateForm } from "../components/sections/EstimateForm";
import { Footer } from "../components/sections/Footer";
import { MobileBar } from "../components/sections/MobileBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: site.seo.title },
      { name: "description", content: site.seo.description },
      { property: "og:title", content: site.seo.title },
      { property: "og:description", content: site.seo.description },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <EmergencyStrip />
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <Services />
        <BeforeAfterSection aside={<Tracker />} />
        <section className="section local" aria-label="Service area and financing">
          <div className="container local-grid">
            <ServiceArea />
            <Financing />
          </div>
        </section>
        <Reviews />
        <EstimateForm />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
