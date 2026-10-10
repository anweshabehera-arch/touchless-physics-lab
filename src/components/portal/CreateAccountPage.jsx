import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { continueAsGuest, saveUser } from "../../auth/authStorage";
import { initializeUserProgress } from "../../auth/experimentStorage";
import AuthShell from "./AuthShell";
import Field from "./Field";

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    const next = {};
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const user = saveUser({ name, email, password });
      initializeUserProgress(user.email);
    } catch (err) {
      setErrors({ email: err.message || "Could not create account." });
      return;
    }

    setPending(true);
    navigate("/login", { replace: true, state: { registered: true } });
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate("/lab");
  };

  return (
    <div className="portal-root">
      <AuthShell
        title="Create your account"
        subtitle="Start exploring physics in a completely new way."
      >
        <form noValidate onSubmit={handleSubmit} className="tpl-form">
          <Field
            label="Full Name"
            name="name"
            icon={User}
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.name}
          />
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password}
          />
          <Field
            label="Confirm Password"
            name="confirm"
            type="password"
            icon={ShieldCheck}
            placeholder="Re-enter password"
            autoComplete="new-password"
            error={errors.confirm}
          />

          <button type="submit" disabled={pending} className="tpl-btn tpl-btn-primary tpl-btn-full">
            <span className="tpl-shimmer" aria-hidden="true" />
            {pending ? "Initializing…" : "Create Account"}
            <ArrowRight aria-hidden="true" className="tpl-icon-sm" />
          </button>

          <p className="tpl-form-note">
            Already have an account?{" "}
            <Link to="/login" className="tpl-text-link">
              Login
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
