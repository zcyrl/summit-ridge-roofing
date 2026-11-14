import { useState, type ReactNode } from "react";
import { site } from "../../../config/site";
import { ImageSlot, RoofArt } from "../ui/ImageSlot";

export function BeforeAfter() {
  const [position, setPosition] = useState(54);

  return (
    <figure className="compare-figure">
      <div
        className="compare"
        style={{ ["--wipe" as string]: `${position}%` } as React.CSSProperties}
      >
        <div className="compare-layer compare-before">
          <ImageSlot
            src={site.images.before.src}
            alt={site.images.before.alt}
            fallback={<RoofArt variant="before" />}
          />
        </div>
        <div className="compare-layer compare-after">
          <ImageSlot
            src={site.images.after.src}
            alt={site.images.after.alt}
            fallback={<RoofArt variant="after" />}
          />
        </div>

        <span className="compare-tag compare-tag-before mono-label">
          {site.images.before.label}
        </span>
        <span className="compare-tag compare-tag-after mono-label">
          {site.images.after.label}
        </span>

        <input
          type="range"
          className="compare-range"
          min={2}
          max={98}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Drag to compare the roof before and after the repair"
          aria-valuetext={`${position}% of the after photo showing`}
        />
        <span className="compare-handle" aria-hidden="true">
          <span className="compare-knob">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="m6 3-4 5 4 5M10 3l4 5-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
        <span className="compare-hint mono-label">Drag to compare</span>
      </div>
      <figcaption className="compare-caption">
        Same house, one week apart. Chalk lines on the left, new underlayment and
        ridge cap on the right.
      </figcaption>
    </figure>
  );
}

export function Gallery() {
  return (
    <div className="gallery-grid" aria-label="Recent projects">
      {site.images.gallery.map((image, index) => (
        <figure className="gallery-item" key={`${image.label}-${index}`}>
          <ImageSlot
            src={image.src}
            alt={image.alt}
            fallback={
              <RoofArt
                variant={index === 0 ? "after" : index === 1 ? "metal" : "flashing"}
              />
            }
          />
          <figcaption className="mono-label">{image.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function BeforeAfterSection({ aside }: { aside?: ReactNode }) {
  return (
    <section
      className="section before-after"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <p className="mono-label">{site.copy.galleryEyebrow}</p>
            <h2 id="work-title">
              {site.copy.galleryTitleLead}{" "}
              <em>{site.copy.galleryTitleAccent}</em>
            </h2>
          </div>
          <p className="section-aside">
            Every job gets before-and-after photos, a material list and a
            close-out walkthrough.
          </p>
        </div>
        <div className="work-grid">
          <BeforeAfter />
          {aside}
        </div>
        <Gallery />
      </div>
    </section>
  );
}
