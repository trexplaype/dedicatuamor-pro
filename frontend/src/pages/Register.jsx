import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import ReCAPTCHA from "react-google-recaptcha";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (!password) return { text: "", className: "" };
  if (score <= 2) return { text: "Seguridad baja", className: "weak" };
  if (score <= 4) return { text: "Seguridad media", className: "medium" };
  return { text: "Seguridad alta", className: "strong" };
}

export default function Register() {
  const navigate = useNavigate();
  const captchaRef = useRef(null);
  const { register, loading, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const passwordStrength = getPasswordStrength(form.password);

  useEffect(() => {
    document.body.className = "auth-page";
    document.title = "Registrarse | DEV AGS";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/my-pages");
    }
  }, [isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!captchaToken) {
      setError("Confirma que no eres un robot.");
      return;
    }

    try {
      await register({
        ...form,
        captcha_token: captchaToken,
      });

      navigate("/my-pages");
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta");

      captchaRef.current?.reset();
      setCaptchaToken("");
    }
  }

  return (
    <main className="auth-main">
      <section className="auth-card register-card">
        <Link to="/" className="auth-brand">
          DEV AGS
        </Link>

        <h1>Registrarse</h1>

        <button className="google-button" type="button">
          <FcGoogle className="google-icon" />
          <span>Continuar con Google</span>
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />

            <button
              className="icon-button"
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {form.password && (
            <div className={`password-strength ${passwordStrength.className}`}>
              <span></span>
              <p>{passwordStrength.text}</p>
            </div>
          )}

          <span className="hint">
            Usa mínimo 6 caracteres, mayúsculas, números y símbolos.
          </span>

          <label htmlFor="password_confirmation">Confirmar contraseña</label>
          <div className="password-wrap">
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />

            <button
              className="icon-button"
              type="button"
              aria-label={
                showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowConfirm((value) => !value)}
            >
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>

          <div className="auth-recaptcha">
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token || "")}
              onExpired={() => setCaptchaToken("")}
            />
          </div>

          <Button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar Sesión</Link>
        </p>
      </section>
    </main>
  );
}
