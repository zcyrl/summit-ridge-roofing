import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { planSlug, site, type Service } from "../../../config/site";
import { trackService } from "../../lib/tracking";
import { ArrowUpRight, ServiceGlyph } from "../ui/Icons";

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLElement | null>(null);
  const plan = site.plans[service.planKey];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackService(service.payloadService, "view");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [service.payloadService]);

  return (
    <article
      ref={ref}
      className="service-card"
      data-whop-product-id={site.whop.productId}
      data-whop-variant-id={plan.id}
      data-whop-price={plan.price}
      data-whop-currency="USD"
    >
      <div className="service-card-top">
        <span className="service-glyph" aria-hidden="true">
          <ServiceGlyph name={service.icon} />
        </span>
        <span className="mono-label service-index">0{index + 1}</span>
      </div>
      <h3>{service.name}</h3>
      <p className="service-description">{service.description}</p>
      <div className="service-footer">
        <div>
          <p className="service-price">{service.priceLabel}</p>
          <p className="service-price-note">{service.priceNote}</p>
        </div>
        <Link
          to="/checkout/$planKey"
          params={{ planKey: planSlug(service.planKey) }}
          className="text-link"
          onClick={() => trackService(service.payloadService, "click")}
          aria-label={`${service.cta} — ${plan.name}, ${service.priceLabel}`}
        >
          Book
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

export function Services() {
  return (
    <section className="section services" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="mono-label">{site.copy.servicesEyebrow}</p>
            <h2 id="services-title">
              {site.copy.servicesTitleLead} <em>{site.copy.servicesTitleAccent}</em>
            </h2>
          </div>
          <p className="section-aside">
            Fixed-price visits, written scopes and a real person on the phone.
          </p>
        </div>

        <div className="services-grid">
          {site.services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
