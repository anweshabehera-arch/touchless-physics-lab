import ParticleField from "./ParticleField";

const EQUATIONS = [
  { text: "F = ma", className: "tpl-eq tpl-eq-1" },
  { text: "a = F / m", className: "tpl-eq tpl-eq-2" },
  { text: "v = u + at", className: "tpl-eq tpl-eq-3" },
  { text: "Δp = FΔt", className: "tpl-eq tpl-eq-4" },
  { text: "E = mc²", className: "tpl-eq tpl-eq-5" },
  { text: "s = ut + ½at²", className: "tpl-eq tpl-eq-6" },
  { text: "p = mv", className: "tpl-eq tpl-eq-7" },
  { text: "KE = ½mv²", className: "tpl-eq tpl-eq-8" },
];

export function OrbitGlow({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`tpl-orbit ${className}`.trim()}
    >
      <div className="tpl-orbit-core" />
      <div className="tpl-orbit-glow" />

      <div className="tpl-orbit-ring">
        <span className="tpl-orbit-dot" />
      </div>

      <div className="tpl-orbit-ring tpl-orbit-ring-inner">
        <span className="tpl-orbit-dot tpl-orbit-dot-accent" />
      </div>

      <div className="tpl-orbit-ring tpl-orbit-ring-outer">
        <span className="tpl-orbit-dot tpl-orbit-dot-small" />
      </div>
    </div>
  );
}

export default function LabBackground({ withOrbit = true }) {
  return (
    <div aria-hidden="true" className="tpl-bg">
      <div className="tpl-bg-wash" />
      <div className="tpl-bg-grid" />

      {withOrbit && <OrbitGlow className="tpl-orbit-center" />}

      <ParticleField />

      {EQUATIONS.map((eq) => (
        <span key={eq.text} className={eq.className}>
          {eq.text}
        </span>
      ))}

      <div className="tpl-bg-vignette" />
    </div>
  );
}