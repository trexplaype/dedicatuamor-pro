import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";
import "./styles/subscribe.css";
import "./styles/mobile-app.css";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);

      if (el) {
        setTimeout(() => {
          el.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      }
    } else {
      window.scrollTo({
        top: 0,
      });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ScrollToHash />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
