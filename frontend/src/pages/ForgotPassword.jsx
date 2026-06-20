import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="auth-main forgot-page">
      <section className="auth-card forgot-card">
        <span className="auth-badge">DEV AGS</span>

        <h1>Recuperar contraseña</h1>

        <p className="auth-subtitle">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="success-message">✓ Revisa tu correo electrónico.</div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>Correo electrónico</label>

            <input
              type="email"
              placeholder="correo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="primary-auth-btn">
              Enviar enlace
            </button>
          </form>
        )}

        <Link to="/login" className="back-login-btn">
          ← Volver al login
        </Link>
      </section>
    </main>
  );
}
