/**
 * THE ONLY FILE A ROOFING COMPANY NEEDS TO EDIT.
 *
 * Everything the site says, sells, charges and shows lives here: identity,
 * service area, services, Whop plan IDs and prices, estimator rates, reviews,
 * financing copy, image slots and both colour themes.
 *
 * Nothing in src/ needs a structural change to reskin this template.
 * The only values that stay in environment variables are credentials.
 */

export type ServiceIcon = "repair" | "replacement" | "inspection";
export type PlanKey = "inspection" | "deposit" | "tuneUp";

export const site = {
  /* ------------------------------------------------------------------ */
  /* Identity                                                            */
  /* ------------------------------------------------------------------ */
  company: {
    name: "Summit Ridge Roofing",
    legalName: "Summit Ridge Roofing LLC",
    logo: {
      leading: "Summit",
      trailing: "Ridge",
    },
    tagline: "Roofs that outlast the weather.",
    phone: "(303) 555-0148",
    phoneHref: "tel:+13035550148",
    email: "hello@summitridgeroofing.com",
    license: "CO-RC-48219",
    licenseState: "Colorado",
    insured: "$2M liability",
    warranty: "10-year workmanship",
    founded: "2009",
    hours: [
      { days: "Monday – Friday", time: "7:00am – 6:00pm" },
      { days: "Saturday", time: "8:00am – 2:00pm" },
      { days: "Emergency tarping", time: "24/7" },
    ],
    address: {
      line1: "4120 Brighton Blvd",
      city: "Denver",
      state: "CO",
      zip: "80216",
    },
  },

  /**
   * Recording aid. Set `enabled: false` (or delete this block) before a real
   * company uses the site. The lead form and invoice tool read these values so
   * every page has believable test data without a query string.
   */
  demo: {
    enabled: true,
    lead: {
      name: "Dana Whitfield",
      phone: "(303) 555-0176",
      email: "dana.whitfield@example.com",
      address: "2841 Ash Street",
      zip: "80207",
      service: "Replacement",
      notes:
        "Hail hit the south slope on 12 May. Missing shingles above the primary bedroom; insurance photos are ready.",
    },
    invoice: {
      jobTotal: "14250",
      customerName: "Dana Whitfield",
      email: "dana.whitfield@example.com",
      memberId: "mber_demo_lead",
      paymentMethodId: "payt_demo_card",
      memo: "Final balance — architectural shingle replacement",
    },
  },

  seo: {
    title: "Summit Ridge Roofing — Roof repair, replacement and inspections",
    description:
      "Roof repairs, full replacements and honest inspections. Book online, pay a deposit, follow your project through to the final invoice.",
  },

  /* ------------------------------------------------------------------ */
  /* Whop                                                                */
  /* ------------------------------------------------------------------ */
  whop: {
    /**
     * Safe to expose: the browser needs it to mount Whop Elements.
     * On whop.app hosting the server prefers the injected WHOP_ACCOUNT_ID,
     * so this is mainly the local-development fallback.
     */
    accountId: "biz_Oo6o9s3OtujsE9",
    /**
     * Set by scripts/create-plans.ts. Used for pixel product attribution only.
     */
    productId: "prod_QNRGg5f3qGSQv",
    /** Sandbox keys and production keys never mix. The UI copy is environment-neutral. */
    environmentLabel: "Whop Payments",
  },

  /**
   * Create these three with `npm run plans:create`, then paste the returned
   * plan_… IDs here. That is the only pricing plumbing this template needs.
   */
  plans: {
    inspection: {
      key: "inspection" as const satisfies PlanKey,
      id: "plan_34sDfuszLWnWL",
      name: "Roof inspection",
      shortName: "Inspection",
      price: 149,
      priceLabel: "$149",
      priceSuffix: "flat",
      description:
        "A 60-minute on-site inspection with a written report, photos and a clear next step. Credited toward a repair booked within 30 days.",
      badge: "One-time payment",
      kind: "one-time" as const,
    },
    deposit: {
      key: "deposit" as const satisfies PlanKey,
      id: "plan_Xw1a8KnMWdNbo",
      name: "Project deposit",
      shortName: "Deposit",
      price: 500,
      priceLabel: "$500",
      priceSuffix: "one-time",
      description:
        "Reserves your installation date. Your card is saved securely for the final balance, which you approve before it is charged.",
      badge: "Reserves your date",
      kind: "deposit" as const,
    },
    tuneUp: {
      key: "tuneUp" as const satisfies PlanKey,
      id: "plan_uUUc8dCqOdOPP",
      name: "Gutter and flashing tune-up",
      shortName: "Tune-up",
      price: 399,
      priceLabel: "$399",
      priceSuffix: "flat",
      description:
        "Clear the gutters, reseal the flashing, replace worn boots and photograph every repair. A flat-rate visit with no surprises.",
      badge: "Most booked",
      kind: "one-time" as const,
    },
  },

  /* ------------------------------------------------------------------ */
  /* Service area                                                        */
  /* ------------------------------------------------------------------ */
  serviceArea: {
    region: "Denver, CO",
    radius: "35 miles",
    cities: [
      "Denver",
      "Lakewood",
      "Aurora",
      "Wheat Ridge",
      "Arvada",
      "Littleton",
      "Englewood",
      "Golden",
    ],
    /** Demo ZIPs. Replace with the ZIPs you actually serve. */
    zips: [
      "80202",
      "80203",
      "80204",
      "80205",
      "80206",
      "80207",
      "80209",
      "80210",
      "80211",
      "80212",
      "80214",
      "80216",
      "80218",
      "80220",
      "80221",
      "80222",
      "80223",
      "80224",
      "80226",
      "80227",
      "80230",
      "80231",
      "80232",
      "80233",
      "80234",
      "80236",
      "80237",
      "80238",
      "80239",
      "80246",
      "80247",
      "80249",
      "80260",
      "80264",
      "80290",
      "80293",
      "80294",
    ],
    responseTime: "within one business day",
  },

  /* ------------------------------------------------------------------ */
  /* Services                           */
  /* ------------------------------------------------------------------ */
  services: [
    {
      id: "repair",
      name: "Repair",
      icon: "repair" as ServiceIcon,
      description:
        "Leaks, lifted flashing, missing shingles and storm damage. We find the cause before we quote the fix.",
      priceLabel: "From $399",
      priceNote: "Gutter and flashing tune-up",
      cta: "Book repair",
      planKey: "tuneUp" as PlanKey,
      planId: "plan_uUUc8dCqOdOPP",
      payloadService: "Repair",
    },
    {
      id: "replacement",
      name: "Replacement",
      icon: "replacement" as ServiceIcon,
      description:
        "Full tear-off and install, underlayment to ridge cap. Written scope, material samples and a dated start.",
      priceLabel: "Deposit $500",
      priceNote: "Reserves your install date",
      cta: "Book replacement",
      planKey: "deposit" as PlanKey,
      planId: "plan_Xw1a8KnMWdNbo",
      payloadService: "Replacement",
    },
    {
      id: "inspection",
      name: "Inspection",
      icon: "inspection" as ServiceIcon,
      description:
        "A written report with photos, moisture readings and a repair plan you can keep. No pressure, no upsell.",
      priceLabel: "$149 flat",
      priceNote: "Credited toward a repair",
      cta: "Book inspection",
      planKey: "inspection" as PlanKey,
      planId: "plan_34sDfuszLWnWL",
      payloadService: "Inspection",
    },
  ],

  /* ------------------------------------------------------------------ */
  /* Instant estimator                                                   */
  /* ------------------------------------------------------------------ */
  estimator: {
    minSqFt: 800,
    maxSqFt: 4000,
    defaultSqFt: 1800,
    step: 50,
    label: "Instant estimate",
    disclaimer:
      "Estimate only. Roof pitch, layers, decking and access change the final scope. We confirm everything on site.",
    materials: [
      {
        id: "asphalt",
        name: "Asphalt",
        description: "Architectural shingle",
        lowPerSqFt: 5,
        highPerSqFt: 8,
      },
      {
        id: "metal",
        name: "Metal",
        description: "Standing seam",
        lowPerSqFt: 9,
        highPerSqFt: 13,
      },
      {
        id: "tile",
        name: "Tile",
        description: "Clay or concrete",
        lowPerSqFt: 12,
        highPerSqFt: 18,
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Project tracker                                                     */
  /* ------------------------------------------------------------------ */
  projectTracker: {
    eyebrow: "Your project, step by step",
    note: "Every paid project gets a private tracker like this one.",
    /** 0-based. The pulsing current step. */
    currentStep: 2,
    steps: [
      {
        label: "Deposit paid",
        description: "Your date is reserved and materials are ordered.",
      },
      {
        label: "Scheduled",
        description: "You get a crew window, a foreman and a weather check.",
      },
      {
        label: "Roofing",
        description: "Tear-off, install and a magnet sweep before we leave.",
      },
      {
        label: "Final invoice",
        description: "Balance is approved by you before the saved card is charged.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Financing                                                           */
  /* ------------------------------------------------------------------ */
  financing: {
    eyebrow: "Financing · shown at checkout",
    headline: "Pay over time.",
    body: "Approved customers can split a roof project into monthly payments. Options such as Klarna, Afterpay and Splitit appear at checkout for approved merchants — no separate application on this site.",
    providers: ["Klarna", "Afterpay", "Splitit"],
    footnote:
      "Subject to provider approval, eligibility and available terms. Summit Ridge Roofing does not make credit decisions and never collects financing details on this page.",
    ctaLabel: "Ask about financing",
  },

  /* ------------------------------------------------------------------ */
  /* Reviews                                                             */
  /* ------------------------------------------------------------------ */
  reviews: {
    average: "4.9/5",
    count: "127 verified reviews",
    items: [
      {
        stars: 5,
        quote:
          "They tarped our roof the same night the storm hit, then walked us through the insurance photos the next morning. The repair was finished before the next rain.",
        name: "Marta Alvarez",
        location: "Berkeley, Denver",
        job: "Storm repair",
      },
      {
        stars: 5,
        quote:
          "The estimate was line by line, not a number on a napkin. Crew arrived when they said, cleaned the yard twice, and the final invoice matched the scope.",
        name: "Devon & Priya Shah",
        location: "Park Hill, Denver",
        job: "Full replacement",
      },
      {
        stars: 5,
        quote:
          "Booked the $149 inspection online, got a written report with photos the same day, and a repair plan that didn't try to sell me a whole new roof.",
        name: "Curtis Nguyen",
        location: "Wheat Ridge, CO",
        job: "Roof inspection",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Image slots                                                         */
  /* ------------------------------------------------------------------ */
  /**
   * Drop files in /public/images and set the paths here, e.g.
   * "/images/hero.jpg". Leave "" to show the built-in line-art fallback.
   * Photos are rendered black-and-white-friendly (grayscale treatment).
   */
  images: {
    hero: {
      src: "",
      alt: "Finished roof on a Summit Ridge Roofing project",
      label: "Recent project · Denver, CO",
    },
    gallery: [
      {
        src: "",
        alt: "Completed shingle roof",
        label: "Denver · Architectural shingle",
      },
      {
        src: "",
        alt: "Standing seam metal roof",
        label: "Lakewood · Standing seam metal",
      },
      {
        src: "",
        alt: "Repaired flashing at a chimney",
        label: "Wash Park · Chimney flashing",
      },
    ],
    before: {
      src: "",
      alt: "Hail-damaged shingles before replacement",
      label: "Before · hail damage",
    },
    after: {
      src: "",
      alt: "New architectural shingle roof after replacement",
      label: "After · new shingle roof",
    },
  },

  /* ------------------------------------------------------------------ */
  /* Brand colours (one theme at a time, never a split screen)           */
  /* ------------------------------------------------------------------ */
  colors: {
    /** Orange stays the same in both themes: black text on it, always. */
    accent: "#FF5A1F",
    onAccent: "#0B0B0B",
    light: {
      bg: "#FFFFFF",
      text: "#0B0B0B",
      muted: "#5A5A5A",
      card: "#F4F3EF",
      line: "#DAD8D1",
      accent2: "#2D3BFF",
      focus: "#2D3BFF",
      danger: "#A83A11",
      accentOnCard: "#D9480F",
    },
    dark: {
      bg: "#0B0B0B",
      text: "#F5F4F0",
      muted: "#A8A8A8",
      card: "#171717",
      line: "#2C2C2C",
      accent2: "#8C96FF",
      focus: "#8C96FF",
      danger: "#FF9A73",
      accentOnCard: "#FF5A1F",
    },
  },

  /* ------------------------------------------------------------------ */
  /* Copy                                                                */
  /* ------------------------------------------------------------------ */
  copy: {
    emergency: "Storm damage? 24/7 emergency tarping",
    heroEyebrow: "DENVER, CO · LICENSED · INSURED",
    heroTitleLead: "Roofs that",
    heroTitleAccent: "outlast",
    heroTitleTail: "the weather.",
    heroBody:
      "Repairs, replacements and honest inspections. Book online, pay a deposit, follow your job to the final invoice.",
    primaryCta: "Request an estimate",
    secondaryCta: "Book an inspection · $149",
    estimatorCta: "Request exact quote",
    servicesEyebrow: "What we do",
    servicesTitleLead: "What we",
    servicesTitleAccent: "do.",
    galleryEyebrow: "Before / after · real project photos go here",
    galleryTitleLead: "See the",
    galleryTitleAccent: "difference.",
    reviewsEyebrow: "Reviews",
    reviewsTitleLead: "Neighbours who",
    reviewsTitleAccent: "noticed.",
    formEyebrow: "Free estimate",
    formTitleLead: "Tell us about",
    formTitleAccent: "your roof.",
    formBody:
      "We reply with a quote, usually within one business day. No call centre, no pressure — just a real scope and a real price.",
    footerBlurb:
      "Licensed, insured and local. We repair what can be repaired, replace what cannot, and put every promise in writing.",
    legal: "Licensed & insured · CO-RC-48219",
  },

  /* ------------------------------------------------------------------ */
  /* Tracking                                                            */
  /* ------------------------------------------------------------------ */
  tracking: {
    events: {
      estimate: "estimate_requested",
      service: "service_viewed",
      deposit: "deposit_started",
    },
    /** Show the event log with ?events=1 on a live site (always on in dev). */
    panelQueryParam: "events",
  },
} as const;

export type Site = typeof site;
export type Service = (typeof site.services)[number];
export type Review = (typeof site.reviews.items)[number];
export type Plan = (typeof site.plans)[PlanKey];
export type Material = (typeof site.estimator.materials)[number];

export const planList = Object.values(site.plans);

export function getPlan(key: PlanKey): Plan {
  return site.plans[key];
}

export function isPlanKey(value: string): value is PlanKey {
  return value === "inspection" || value === "deposit" || value === "tuneUp";
}

/** Clean URL slug for a plan key. */
export function planSlug(key: PlanKey): string {
  return key === "tuneUp" ? "tune-up" : key;
}

/** Accepts the config key and the clean URL slug used in links. */
export function resolvePlanKey(value: string): PlanKey | null {
  if (isPlanKey(value)) return value;
  if (value === "tune-up") return "tuneUp";
  return null;
}

export function formatUsd(value: number, opts: { decimals?: boolean } = {}): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.decimals === false ? 0 : 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsdRange(low: number, high: number): string {
  return `${formatUsd(low)} – ${formatUsd(high)}`;
}

/**
 * The CSS custom properties for a theme. Emitted into <head> so the colours
 * in this config are the only source of truth.
 */
export function themeCss(): string {
  const { accent, onAccent, light, dark } = site.colors;
  const vars = (c: typeof light | typeof dark, scheme: "light" | "dark") => `
    color-scheme: ${scheme};
    --bg: ${c.bg};
    --text: ${c.text};
    --muted: ${c.muted};
    --card: ${c.card};
    --line: ${c.line};
    --accent: ${accent};
    --on-accent: ${onAccent};
    --accent-2: ${c.accent2};
    --focus: ${c.focus};
    --danger: ${c.danger};
    --accent-on-card: ${c.accentOnCard};
    --surface: ${c.bg};
    --card-strong: color-mix(in srgb, ${c.card} 78%, ${c.text} 22%);
    --line-strong: color-mix(in srgb, ${c.line} 70%, ${c.text} 30%);
  `;
  return `:root{${vars(light, "light")}}
:root[data-theme="dark"]{${vars(dark, "dark")}}`;
}
