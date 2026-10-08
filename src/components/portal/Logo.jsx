export function LogoMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`tpl-logo-mark ${className}`.trim()}
    >
      <circle cx="20" cy="20" r="3.6" fill="currentColor" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.6"
        transform="rotate(60 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.4"
        transform="rotate(-60 20 20)"
      />
    </svg>
  );
}

export default function Logo({ size = "md" }) {
  return (
    <div className={`tpl-logo tpl-logo-${size}`}>
      <LogoMark />
      <span>
        Touchless <span className="tpl-logo-accent">Physics</span> Lab
      </span>
    </div>
  );
}
