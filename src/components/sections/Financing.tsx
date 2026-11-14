import { site } from "../../../config/site";
import { ArrowRight } from "../ui/Icons";

export function Financing() {
  return (
    <section
      className="financing-card"
      id="financing"
      aria-labelledby="financing-title"
    >
      <div className="financing-head">
        <p className="mono-label">{site.financing.eyebrow}</p>
        <h2 id="financing-title">
          {site.financing.headline.split(" ").map((word, index) =>
            index === site.financing.headline.split(" ").length - 1 ? (
              <em key={word}>{word}</em>
            ) : (
              <span key={`${word}-${index}`}>{word} </span>
            ),
          )}
        </h2>
      </div>
      <p className="financing-body">{site.financing.body}</p>
      <div className="provider-list" aria-label="Financing providers that may appear at checkout">
        {site.financing.providers.map((provider) => (
          <span key={provider}>{provider}</span>
        ))}
      </div>
      <div className="financing-foot">
        <a className="text-link" href="#estimate">
          {site.financing.ctaLabel}
          <ArrowRight size={17} />
        </a>
        <p>{site.financing.footnote}</p>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section
      className="section reviews"
      id="reviews"
      aria-labelledby="reviews-title"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <p className="mono-label">{site.copy.reviewsEyebrow}</p>
            <h2 id="reviews-title">
              {site.copy.reviewsTitleLead}{" "}
              <em>{site.copy.reviewsTitleAccent}</em>
            </h2>
          </div>
          <p className="reviews-score">
            <span>{site.reviews.average}</span>
            <span className="mono-label">{site.reviews.count}</span>
          </p>
        </div>

        <div className="reviews-grid">
          {site.reviews.items.map((review, index) => (
            <figure className="review-card" key={`${review.name}-${index}`}>
              <div
                className="review-stars"
                role="img"
                aria-label={`${review.stars} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <svg
                    key={starIndex}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={starIndex < review.stars ? "var(--accent)" : "none"}
                    stroke="var(--accent)"
                    strokeWidth="1.4"
                    aria-hidden="true"
                  >
                    <path d="m12 3.2 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.2Z" />
                  </svg>
                ))}
              </div>
              <blockquote>“{review.quote}”</blockquote>
              <figcaption>
                <span>{review.name}</span>
                <span className="mono-label">
                  {review.location} · {review.job}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
