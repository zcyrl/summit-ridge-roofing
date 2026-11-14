import { Moon, Sun } from "./Icons";
import { useTheme } from "../../lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const target = theme === "dark" ? "Light" : "Dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={`Switch to ${target.toLowerCase()} theme`}
      title={`Switch to ${target.toLowerCase()} theme`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
        </span>
      </span>
      <span className="theme-toggle-label" aria-hidden="true">
        <span className="theme-label-light">Light</span>
        <span className="theme-label-dark">Dark</span>
      </span>
    </button>
  );
}
