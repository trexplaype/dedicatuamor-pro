import { NavLink } from "react-router-dom";
import { FaHome, FaHeart, FaGift, FaBookOpen, FaUser } from "react-icons/fa";

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" end>
        <FaHome />
        <span>Inicio</span>
      </NavLink>

      <NavLink to="/templates">
        <FaHeart />
        <span>Plantillas</span>
      </NavLink>

      <NavLink to="/rewards">
        <FaGift />
        <span>Ganar</span>
      </NavLink>

      <NavLink to="/my-pages">
        <FaBookOpen />
        <span>Páginas</span>
      </NavLink>

      <NavLink to="/profile">
        <FaUser />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}
