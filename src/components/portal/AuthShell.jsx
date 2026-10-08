import LabBackground from "./LabBackground";
import Logo from "./Logo";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="tpl-auth">
      <LabBackground />
      <div className="tpl-glass tpl-auth-card tpl-rise">
        <span aria-hidden="true" className="tpl-card-edge" />
        <header className="tpl-auth-header">
          <Logo />
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        <div className="tpl-auth-body">{children}</div>
      </div>
      <p className="tpl-tagline">Learn Physics. Move It. See It.</p>
    </main>
  );
}
