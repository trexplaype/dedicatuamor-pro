import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    document.title = "DEV AGS | Dedicatorias interactivas";

    const bodyClassByRoute = {
      "/": "home-page",
      "/templates": "templates-page",
      "/my-pages": "panel-page",
    };

    document.body.className =
      bodyClassByRoute[location.pathname] || "home-page";
  }, [location.pathname]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
