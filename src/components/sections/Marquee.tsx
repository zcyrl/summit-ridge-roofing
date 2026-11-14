const items = [
  "Repair",
  "Replacement",
  "Inspection",
  "Financing",
  "Storm response",
  "Gutter tune-up",
];

export function Marquee() {
  const sequence = [...items, ...items];

  return (
    <div className="marquee" aria-label="Services: repair, replacement, inspection, financing and storm response">
      <p className="sr-only">
        Repair, replacement, inspection, financing, storm response and gutter
        tune-up.
      </p>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy}>
            {sequence.map((item, index) => (
              <span key={`${copy}-${item}-${index}`}>
                {item} <i aria-hidden="true">/</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
