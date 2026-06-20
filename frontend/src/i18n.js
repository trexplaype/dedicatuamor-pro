import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      nav: {
        home: "Inicio",
        templates: "Plantillas",
        plans: "Planes",
        myPages: "Mis Páginas",
        login: "Iniciar sesión",
        register: "Registrarse",
        logout: "Cerrar sesión",
      },
      footer: {
        navigation: "Navegación",
        account: "Cuenta",
        contact: "Contacto",
      },
      home: {
        heroBadge: "Plataforma premium de dedicatorias digitales",
        heroTitle: "Dedicatorias interactivas para momentos inolvidables",
        heroText:
          "Crea páginas privadas con fotos, música, mensajes y animaciones. Comparte un enlace elegante para aniversarios, cumpleaños, San Valentín o cualquier sorpresa especial.",
        createPage: "Crear mi página",
        exploreTemplates: "Explorar plantillas",
        howWorks: "¿Cómo funciona?",
        subscriptions: "Suscripciones",
        plansTitle: "Planes para cada dedicatoria",
      },
    },
  },

  en: {
    translation: {
      nav: {
        home: "Home",
        templates: "Templates",
        plans: "Plans",
        myPages: "My Pages",
        login: "Log in",
        register: "Sign up",
        logout: "Log out",
      },
      footer: {
        navigation: "Navigation",
        account: "Account",
        contact: "Contact",
      },
      home: {
        heroBadge: "Premium digital dedication platform",
        heroTitle: "Interactive dedications for unforgettable moments",
        heroText:
          "Create private pages with photos, music, messages, and animations. Share an elegant link for anniversaries, birthdays, Valentine’s Day, or any special surprise.",
        createPage: "Create my page",
        exploreTemplates: "Explore templates",
        howWorks: "How does it work?",
        subscriptions: "Subscriptions",
        plansTitle: "Plans for every dedication",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
