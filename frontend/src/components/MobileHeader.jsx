import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function MobileHeader() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isTemplatesPage = location.pathname === "/templates";
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);

    const cleanValue = value.trim();

    if (cleanValue) {
      navigate(`/templates?search=${encodeURIComponent(cleanValue)}`);
    } else {
      navigate("/templates");
    }
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/templates");
  };

  return (
    <header className={`mobile-header ${isTemplatesPage ? "only-search" : ""}`}>
      {!isTemplatesPage && (
        <div className="mobile-header-top">
          <Link to="/" className="mobile-logo">
            DEV AGS
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/wallet" className="mobile-coins">
                🪙 {user?.coins || 0}
              </Link>

              <Link to="/profile" className="mobile-user-info">
                <span className="mobile-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="mobile-user-text">
                  <strong>{user?.name || "Usuario"}</strong>
                  <small>ID {user?.public_id || "00000000"}</small>
                </span>
              </Link>
            </>
          )}
        </div>
      )}

      {isTemplatesPage && (
        <div className="mobile-search-box">
          <span className="mobile-search-icon">🔍</span>

          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={search}
            onChange={handleSearch}
          />

          {search && (
            <button
              type="button"
              className="mobile-search-clear"
              onClick={clearSearch}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </header>
  );
}
