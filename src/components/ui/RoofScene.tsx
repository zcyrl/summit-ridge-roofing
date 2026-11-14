export function RoofScene() {
  return (
    <svg
      viewBox="0 0 600 480"
      className="roof-scene"
      role="img"
      aria-label="Line drawing of a house with a freshly finished roof and an orange sun"
    >
      <g className="scene-sun">
        <circle cx="455" cy="112" r="38" fill="var(--accent)" />
        {Array.from({ length: 10 }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / 10;
          const inner = 54;
          const outer = 67;
          return (
            <line
              key={index}
              x1={455 + Math.cos(angle) * inner}
              y1={112 + Math.sin(angle) * inner}
              x2={455 + Math.cos(angle) * outer}
              y2={112 + Math.sin(angle) * outer}
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </g>

      <path
        className="scene-cloud scene-float-a"
        d="M76 176h92M92 196h60M112 216h42"
        stroke="var(--text)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".7"
      />
      <path
        className="scene-cloud scene-float-b"
        d="M468 356h74M486 374h44"
        stroke="var(--accent-2)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".7"
      />

      <path
        className="scene-draw scene-roof"
        pathLength="1"
        d="M70 330 300 136l230 194"
        fill="none"
        stroke="var(--text)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="scene-draw scene-roof-accent"
        pathLength="1"
        d="M136 322 300 184l164 138"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="scene-draw scene-walls"
        pathLength="1"
        d="M120 330v100h360V330"
        fill="none"
        stroke="var(--text)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="scene-draw scene-chimney"
        pathLength="1"
        d="M398 236v-88h47v120"
        fill="none"
        stroke="var(--text)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M406 166h31M406 180h31"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        className="scene-draw scene-door"
        pathLength="1"
        d="M268 430v-72h64v72"
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M300 358v72"
        stroke="var(--accent-2)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="300" cy="394" r="3" fill="var(--accent-2)" />

      <g className="scene-spark scene-float-a" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
        <path d="M188 106v14M181 113h14" />
      </g>
      <g className="scene-spark scene-float-b" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round">
        <circle cx="506" cy="274" r="6" fill="none" />
      </g>

      <path d="M88 430h424" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M90 448h96M208 448h58"
        stroke="var(--line-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  );
}
