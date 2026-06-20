import { Outlet } from "react-router-dom";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import "../styles/mobile-app.css";

export default function MobileLayout() {
  return (
    <main className="mobile-app-shell">
      <MobileHeader />

      <div className="mobile-content">
        <Outlet />
      </div>

      <MobileBottomNav />
    </main>
  );
}
