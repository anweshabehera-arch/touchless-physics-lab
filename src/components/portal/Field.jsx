import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export default function Field({
  label,
  name,
  icon: Icon,
  error,
  type = "text",
  ...props
}) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="tpl-field">
      <label htmlFor={id} className="tpl-field-label">
        {label}
      </label>
      <div className={`tpl-field-box ${error ? "is-error" : ""}`}>
        {Icon && <Icon aria-hidden="true" className="tpl-field-icon" />}
        <input
          id={id}
          name={name}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="tpl-field-input"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="tpl-field-reveal"
          >
            {reveal ? <EyeOff className="tpl-icon-sm" /> : <Eye className="tpl-icon-sm" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="tpl-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
