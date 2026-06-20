import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    document.body.className = "auth-page";
    document.title = "Iniciar Sesión | DEV AGS";
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/my-pages");
  }, [isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/my-pages");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    }
  }

  return (
    <main className="auth-main">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          DEV AGS
        </Link>
        <h1>Iniciar Sesión</h1>

        <button className="google-button" type="button">
          <FcGoogle className="google-icon" />
          <span>Continuar con Google</span>
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

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
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              className="icon-button"
              type="button"
              aria-label="Mostrar contraseña"
              onClick={() => setShowPassword((value) => !value)}
            >
              👁
            </button>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input type="checkbox" name="remember" />
              Recordarme
            </label>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          <Button type="submit" className="auth-submit">
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
        </p>
      </section>
    </main>
  );
}
