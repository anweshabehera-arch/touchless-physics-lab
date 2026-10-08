import { ArrowRight, Check, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authenticate, continueAsGuest, setSession } from "../../auth/authStorage";
import AuthShell from "./AuthShell";
import Field from "./Field";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const registered = Boolean(location.state?.registered);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const remember = form.get("remember") === "on";

    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const user = authenticate(email, password);
    if (!user) {
      setErrors({ password: "Email or password does not match a saved account." });
      return;
    }

    setPending(true);
    setSession({ guest: false, name: user.name, email: user.email }, remember);
    navigate("/dashboard", { replace: true });
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate("/lab");
  };

  return (
    <div className="portal-root">
      <AuthShell title="Welcome Back" subtitle="Continue your physics journey.">
        <form noValidate onSubmit={handleSubmit} className="tpl-form">
          {registered && (
            <p className="tpl-banner" role="status">
              Account created. Sign in to open your dashboard.
            </p>
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="you@school.edu"
            autoComplete="email"
            error={errors.email}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password}
          />

          <div className="tpl-login-row">
            <label className="tpl-check">
              <input type="checkbox" name="remember" className="tpl-check-input" defaultChecked />
              <span className="tpl-check-box">
                <Check aria-hidden="true" className="tpl-check-icon" strokeWidth={3} />
              </span>
              Remember me
            </label>
            <a
              href="#forgot"
              className="tpl-text-link"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={pending} className="tpl-btn tpl-btn-primary tpl-btn-full">
            <span className="tpl-shimmer" aria-hidden="true" />
            {pending ? "Authenticating…" : "Login"}
            <ArrowRight aria-hidden="true" className="tpl-icon-sm" />
          </button>

          <p className="tpl-form-note">
            Don&apos;t have an account?{" "}
            <Link to="/" className="tpl-text-link">
              Create Account
            </Link>
          </p>

          <div className="tpl-divider" role="separator">
            <span>or</span>
          </div>

          <button type="button" className="tpl-btn tpl-btn-secondary tpl-btn-full" onClick={handleGuest}>
            <Sparkles aria-hidden="true" className="tpl-icon-sm" />
            Continue as Guest
          </button>
        </form>
      </AuthShell>
    </div>
  );
}
