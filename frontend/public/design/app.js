const includePartials = async () => {
  const includes = [...document.querySelectorAll("[data-include]")];

  await Promise.all(
    includes.map(async (placeholder) => {
      const response = await fetch(placeholder.dataset.include);
      placeholder.outerHTML = await response.text();
    }),
  );
};

const translations = {
  es: {
    templates: "Plantillas",
    plans: "Planes",
    myPages: "Mis Páginas",
    myPlans: "Mis planes",
    paymentHistory: "Historial de pagos",
    settings: "Configuración",
    logout: "Cerrar Sesión",
  },
  en: {
    templates: "Templates",
    plans: "Plans",
    myPages: "My Pages",
    myPlans: "My plans",
    paymentHistory: "Payment history",
    settings: "Settings",
    logout: "Log out",
  },
};

const textTranslations = {
  Inicio: "Home",
  Plantillas: "Templates",
  Planes: "Plans",
  "Cómo funciona": "How it works",
  "Mis Páginas": "My Pages",
  "Mis páginas": "My pages",
  "Mis planes": "My plans",
  "Historial de pagos": "Payment history",
  Configuración: "Settings",
  "Cerrar Sesión": "Log out",
  "Iniciar Sesión": "Log In",
  "Iniciar sesión": "Log in",
  Registrarse: "Sign Up",
  Español: "Spanish",
  English: "English",
  "Plataforma premium de dedicatorias digitales":
    "Premium digital dedication platform",
  "Dedicatorias interactivas para momentos inolvidables":
    "Interactive dedications for unforgettable moments",
  "Crea páginas privadas con fotos, música, mensajes y animaciones. Comparte un enlace elegante para aniversarios, cumpleaños, San Valentín o cualquier sorpresa especial.":
    "Create private pages with photos, music, messages, and animations. Share an elegant link for anniversaries, birthdays, Valentine's Day, or any special surprise.",
  "Crear mi página": "Create my page",
  "Explorar plantillas": "Explore templates",
  plantillas: "templates",
  "para publicar": "to publish",
  Privado: "Private",
  "con contraseña": "with password",
  "Para ti": "For you",
  "Un detalle hecho con amor": "A detail made with love",
  Galería: "Gallery",
  "Fotos + música": "Photos + music",
  "Enlace listo": "Link ready",
  "Comparte por WhatsApp": "Share via WhatsApp",
  "Diseños interactivos": "Interactive designs",
  "Experiencias con animaciones y efectos visuales.":
    "Experiences with animations and visual effects.",
  "Fácil de compartir": "Easy to share",
  "Entrega tu dedicatoria con un enlace privado.":
    "Deliver your dedication with a private link.",
  "Personalización completa": "Full customization",
  "Nombres, fotos, música, mensajes y contraseña.":
    "Names, photos, music, messages, and password.",
  "Simple y rápido": "Simple and fast",
  "¿Cómo funciona?": "How does it work?",
  "Crea tu página de dedicatoria en tres simples pasos":
    "Create your dedication page in three simple steps",
  "Paso 1": "Step 1",
  "Paso 2": "Step 2",
  "Paso 3": "Step 3",
  "Elige una plantilla": "Choose a template",
  "30+ plantillas interactivas con animaciones y estilos para cada ocasión.":
    "30+ interactive templates with animations and styles for every occasion.",
  "Personaliza tu página": "Customize your page",
  "Agrega fotos, mensajes, nombres y contraseña para proteger tu dedicatoria.":
    "Add photos, messages, names, and a password to protect your dedication.",
  "Comparte con tu persona especial": "Share it with your special person",
  "Comparte el enlace por WhatsApp o redes sociales y sácale una sonrisa.":
    "Share the link through WhatsApp or social media and make them smile.",
  "Nuestra colección": "Our collection",
  "Plantillas destacadas": "Featured templates",
  "Ver todas las plantillas": "View all templates",
  "Dedicatoria Especial": "Special Dedication",
  "Crea una dedicatoria única para celebrar momentos especiales.":
    "Create a unique dedication to celebrate special moments.",
  "Crear página": "Create page",
  "Ver plantilla": "View template",
  "Caja de Chocolates de Amor": "Love Chocolate Box",
  "Caja interactiva con mensajes ocultos y sorpresa final.":
    "Interactive box with hidden messages and a final surprise.",
  "Caja de chocolates interactiva con mensajes ocultos.":
    "Interactive chocolate box with hidden messages.",
  "Galaxia del Amor": "Love Galaxy",
  "Universo visual con estrellas, corazón central y movimiento.":
    "Visual universe with stars, a central heart, and motion.",
  "Hoyo negro, anillo de acreción y estrellas flotantes.":
    "Black hole, accretion ring, and floating stars.",
  "Universo del Amor": "Love Universe",
  "Universo 3D girando con foto, música y mensaje central.":
    "Spinning 3D universe with photo, music, and central message.",
  "Universo 3D girando con foto y música.":
    "Spinning 3D universe with photo and music.",
  "Carta Animada": "Animated Letter",
  "Una carta digital con apertura suave y mensaje dedicado.":
    "A digital letter with a soft opening and dedicated message.",
  Suscripciones: "Subscriptions",
  "Planes para cada dedicatoria": "Plans for every dedication",
  "Empieza gratis y sube a Premium o VIP cuando quieras más efectos y personalización.":
    "Start free and upgrade to Premium or VIP when you want more effects and customization.",
  Gratis: "Free",
  "/ prueba": "/ trial",
  "1 página de dedicatoria": "1 dedication page",
  "Plantilla Standard": "Standard template",
  "Música y frases editables": "Editable music and phrases",
  "Enlace para compartir": "Shareable link",
  "Empezar gratis": "Start free",
  "Más elegido": "Most chosen",
  "/ página": "/ page",
  "Todo lo de Standard": "Everything in Standard",
  "Carta romántica": "Romantic letter",
  "Corazones y pétalos": "Hearts and petals",
  "Promesa final": "Final promise",
  "Elegir Premium": "Choose Premium",
  "Todo lo de Premium": "Everything in Premium",
  "Experiencia VIP completa": "Complete VIP experience",
  "Botones especiales": "Special buttons",
  "Soporte de personalización": "Customization support",
  "Crear VIP": "Create VIP",
  "¿Listo para sorprender a alguien especial?":
    "Ready to surprise someone special?",
  "Crea una página de dedicatoria única que nunca olvidará. Empieza ahora, solo toma unos minutos.":
    "Create a unique dedication page they will never forget. Start now, it only takes a few minutes.",
  "Crear Mi Dedicatoria": "Create My Dedication",
  "Crea dedicatorias digitales memorables con plantillas interactivas, música, fotos y enlaces privados.":
    "Create memorable digital dedications with interactive templates, music, photos, and private links.",
  Navegación: "Navigation",
  Cuenta: "Account",
  Contacto: "Contact",
  Soporte: "Support",
  "© 2026 DEV AGS. Todos los derechos reservados.":
    "© 2026 DEV AGS. All rights reserved.",
  "Términos · Privacidad": "Terms · Privacy",
  "Continuar con Google": "Continue with Google",
  o: "or",
  "Correo electrónico": "Email",
  Contraseña: "Password",
  Recordarme: "Remember me",
  "¿Olvidaste tu contraseña?": "Forgot your password?",
  "¿No tienes cuenta?": "Don't have an account?",
  Nombre: "Name",
  "Mínimo 6 caracteres": "Minimum 6 characters",
  "Confirmar Contraseña": "Confirm Password",
  "¿Ya tienes cuenta?": "Already have an account?",
  "Correo o contraseña incorrectos.": "Incorrect email or password.",
  Listo: "Done",
  Tendencia: "Trending",
  Todos: "All",
  Juegos: "Games",
  "San Valentín": "Valentine's Day",
  Cumpleaños: "Birthdays",
  "Plantillas disponibles": "Available templates",
  "Árbol del Amor": "Love Tree",
  "Árbol animado con contador de tiempo, carta sorpresa y carrusel de fotos.":
    "Animated tree with timer, surprise letter, and photo carousel.",
  "Galaxy Gallery": "Galaxy Gallery",
  "Una galería 3D dentro de una galaxia con agujero negro y partículas.":
    "A 3D gallery inside a galaxy with a black hole and particles.",
  "Latidos de Luz": "Light Beats",
  "Un corazón 3D animado con texto que late, fotos en burbujas y música.":
    "An animated 3D heart with pulsing text, bubble photos, and music.",
  "Netflix de Amor": "Love Netflix",
  "Crea tu propia serie de amor estilo Netflix con perfiles, episodios y video.":
    "Create your own Netflix-style love series with profiles, episodes, and video.",
  "Corazón Galáctico": "Galactic Heart",
  "Corazón galáctico con partículas, texto y fotos flotantes.":
    "Galactic heart with particles, text, and floating photos.",
  "Pregunta Romántica": "Romantic Question",
  "Haz una pregunta romántica de sí o no con una escena especial.":
    "Ask a romantic yes-or-no question with a special scene.",
  "El Camino Juntos": "The Path Together",
  "Un globo terráqueo 3D interactivo que une dos ciudades.":
    "An interactive 3D globe connecting two cities.",
  "Heart Shooter": "Heart Shooter",
  "Juego romántico heart shooter con mensajes finales.":
    "Romantic heart shooter game with final messages.",
  "Mostrando 12 de 30 plantillas": "Showing 12 of 30 templates",
  "Mi panel": "My dashboard",
  "Administra tus páginas, planes y pagos":
    "Manage your pages, plans, and payments",
  "Aún no tienes páginas": "You don't have pages yet",
  "Crea tu primera página personalizada en minutos":
    "Create your first personalized page in minutes",
  "Crear mi primera página": "Create my first page",
  "Páginas compradas": "Purchased pages",
  "Comprar más →": "Buy more →",
  "No tienes compras de páginas": "You don't have page purchases",
  "Ver planes de pago único →": "View one-time payment plans →",
  "Mejorar plan mensual →": "Upgrade monthly plan →",
  "No tienes suscripciones activas": "You don't have active subscriptions",
  "Ver planes mensuales →": "View monthly plans →",
  Pagos: "Payments",
  "No tienes pagos registrados": "You don't have registered payments",
  "Tus pagos aparecerán aquí": "Your payments will appear here",
};

const reverseTextTranslations = Object.fromEntries(
  Object.entries(textTranslations).map(([spanish, english]) => [
    english,
    spanish,
  ]),
);

const placeholderTranslations = {
  "Buscar plantillas...": "Search templates...",
  "Buscar plantillas": "Search templates",
  "Cambiar idioma": "Change language",
  "DEV AGS inicio": "DEV AGS home",
  "Navegación principal": "Main navigation",
  "Abrir menú de cuenta": "Open account menu",
  "Mostrar contraseña": "Show password",
  "Ocultar contraseña": "Hide password",
};

const reversePlaceholderTranslations = Object.fromEntries(
  Object.entries(placeholderTranslations).map(([spanish, english]) => [
    english,
    spanish,
  ]),
);

const preserveWhitespace = (original, replacement) => {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${replacement}${trailing}`;
};

const translateTextContent = (language) => {
  const dictionary =
    language === "en" ? textTranslations : reverseTextTranslations;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const trimmed = node.nodeValue.trim();
    if (!trimmed || !dictionary[trimmed]) return;
    node.nodeValue = preserveWhitespace(node.nodeValue, dictionary[trimmed]);
  });
};

const translateAttributes = (language) => {
  const dictionary =
    language === "en"
      ? placeholderTranslations
      : reversePlaceholderTranslations;
  const attributes = ["placeholder", "aria-label", "title", "alt"];

  document.querySelectorAll("*").forEach((element) => {
    attributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value && dictionary[value])
        element.setAttribute(attribute, dictionary[value]);
    });
  });
};

const translateDocumentTitle = (language) => {
  const path = window.location.pathname;
  const titles = {
    home: {
      es: "DEV AGS | Dedicatorias interactivas",
      en: "DEV AGS | Interactive dedications",
    },
    templates: {
      es: "Plantillas | DEV AGS",
      en: "Templates | DEV AGS",
    },
    panel: {
      es: "Mi panel | DEV AGS",
      en: "My dashboard | DEV AGS",
    },
    login: {
      es: "Iniciar Sesión | DEV AGS",
      en: "Log In | DEV AGS",
    },
    register: {
      es: "Registrarse | DEV AGS",
      en: "Sign Up | DEV AGS",
    },
  };

  const page = path.includes("/templates/")
    ? "templates"
    : path.includes("/my-pages/")
      ? "panel"
      : path.endsWith("/login.html")
        ? "login"
        : path.endsWith("/register.html")
          ? "register"
          : "home";

  document.title = titles[page][language] ?? titles[page].es;
};

const applyLanguage = (language) => {
  const dictionary = translations[language] ?? translations.es;
  document.documentElement.lang = language;
  localStorage.setItem("DEV AGS-language", language);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  document.querySelectorAll("[data-lang-option]").forEach((option) => {
    option.classList.toggle("active", option.dataset.langOption === language);
  });

  document.querySelectorAll("[data-current-language]").forEach((element) => {
    element.textContent = language.toUpperCase();
  });

  document
    .querySelectorAll(".dashboard-language .mini-flag")
    .forEach((flag) => {
      flag.classList.toggle("flag-es", language === "es");
      flag.classList.toggle("flag-en", language === "en");
    });

  translateTextContent(language);
  translateAttributes(language);
  translateDocumentTitle(language);
};

const renderLoggedNavigation = () => {
  const navActions = document.querySelector(".nav-actions");
  const isAuthPage = document.body.classList.contains("auth-page");
  const isLogged = localStorage.getItem("DEV AGS-auth") === "true";

  if (!navActions || isAuthPage || !isLogged) return;

  document.body.classList.add("user-logged-in");
  navActions.classList.add("dashboard-actions");
  navActions.innerHTML = `
    <div class="dropdown language-dropdown">
      <button class="language dashboard-language" type="button" aria-label="Cambiar idioma" data-menu-button="languageMenu">
        <span class="mini-flag flag-es" aria-hidden="true"></span>
        <span data-current-language>ES</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="dropdown-menu language-menu" id="languageMenu">
        <button class="dropdown-item active" type="button" data-lang-option="es">
          <span class="mini-flag flag-es" aria-hidden="true"></span>
          <span>Español</span>
          <span class="check-mark" aria-hidden="true"></span>
        </button>
        <button class="dropdown-item" type="button" data-lang-option="en">
          <span class="mini-flag flag-en" aria-hidden="true"></span>
          <span>English</span>
          <span class="check-mark" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div class="dropdown account-dropdown">
      <button class="account-button" type="button" aria-label="Abrir menú de cuenta" data-menu-button="accountMenu">
        <span class="avatar">A</span>
        <span class="account-name">Amil Guty sal</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="dropdown-menu account-menu" id="accountMenu">
        <div class="account-summary">
          <strong>Amil Guty sal</strong>
          <span>amilgutysal@gmail.com</span>
        </div>
        <a class="dropdown-item" href="/my-pages/">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>
          <span data-i18n="myPages">Mis Páginas</span>
        </a>
        <a class="dropdown-item" href="/my-pages/#plans">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v10H4zM4 11h16"/></svg>
          <span data-i18n="myPlans">Mis planes</span>
        </a>
        <a class="dropdown-item" href="/my-pages/#payments">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v4H7zM5 7h14v14H5zM9 12h6M9 16h4"/></svg>
          <span data-i18n="paymentHistory">Historial de pagos</span>
        </a>
        <a class="dropdown-item" href="/index.html#inicio">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M3 12h2m14 0h2M12 3v2m0 14v2m6.4-15.4-1.4 1.4M7 17l-1.4 1.4M5.6 5.6 7 7m10 10 1.4 1.4"/></svg>
          <span data-i18n="settings">Configuración</span>
        </a>
        <a class="dropdown-item logout-item" href="/login.html" data-logout>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M21 4v16h-7"/></svg>
          <span data-i18n="logout">Cerrar Sesión</span>
        </a>
      </div>
    </div>
  `;
};

const markActiveNavigation = () => {
  const path = window.location.pathname;
  const activeKey = path.includes("/templates/")
    ? "templates"
    : path.includes("/my-pages/")
      ? "my-pages"
      : "home";
  document
    .querySelector(`[data-nav="${activeKey}"]`)
    ?.classList.add("nav-active");
};

const initTheme = () => {
  const themeButton = document.querySelector(".theme-toggle");

  if (localStorage.getItem("DEV AGS-theme") === "light") {
    document.body.classList.add("light-mode");
  }

  themeButton?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem(
      "DEV AGS-theme",
      document.body.classList.contains("light-mode") ? "light" : "dark",
    );
  });
};

const initPasswordToggles = () => {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.closest(".password-wrap")?.querySelector("input");
      if (!input) return;

      const isHidden = input.type === "password";
      const isEnglish = localStorage.getItem("DEV AGS-language") === "en";
      input.type = isHidden ? "text" : "password";
      button.setAttribute(
        "aria-label",
        isHidden
          ? isEnglish
            ? "Hide password"
            : "Ocultar contraseña"
          : isEnglish
            ? "Show password"
            : "Mostrar contraseña",
      );
    });
  });
};

const initCarousel = () => {
  const track = document.querySelector("#templatesTrack");

  document.querySelectorAll("[data-carousel]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!track) return;

      const direction = button.dataset.carousel === "next" ? 1 : -1;
      const card = track.querySelector(".template-card");
      const step = card ? card.getBoundingClientRect().width + 24 : 320;

      track.scrollBy({
        left: direction * step,
        behavior: "smooth",
      });
    });
  });
};

const initAuthForms = () => {
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submit = form.querySelector(".auth-submit");
      const originalText = submit?.textContent ?? "";
      const isLoginPage = window.location.pathname
        .toLowerCase()
        .endsWith("login.html");
      const email = form
        .querySelector('input[name="email"]')
        ?.value.trim()
        .toLowerCase();
      const password = form.querySelector('input[name="password"]')?.value;
      let message = form.querySelector(".form-message");

      if (!message) {
        message = document.createElement("p");
        message.className = "form-message";
        form.appendChild(message);
      }

      if (
        isLoginPage &&
        (email !== "amilgutysal@gmail.com" || password !== "12345")
      ) {
        message.textContent =
          localStorage.getItem("DEV AGS-language") === "en"
            ? "Incorrect email or password."
            : "Correo o contraseña incorrectos.";
        message.classList.add("error");
        return;
      }

      message.textContent = "";
      message.classList.remove("error");

      if (submit) {
        submit.textContent =
          localStorage.getItem("DEV AGS-language") === "en" ? "Done" : "Listo";
        submit.disabled = true;
        window.setTimeout(() => {
          localStorage.setItem("DEV AGS-auth", "true");
          window.location.href = "/index.html";
          submit.textContent = originalText;
          submit.disabled = false;
        }, 1300);
      }
    });
  });
};

const initDropdowns = () => {
  document.querySelectorAll("[data-menu-button]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const dropdown = button.closest(".dropdown");
      const isOpen = dropdown?.classList.contains("open");

      document
        .querySelectorAll(".dropdown.open")
        .forEach((item) => item.classList.remove("open"));
      if (dropdown && !isOpen) dropdown.classList.add("open");
    });
  });

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown.open")
      .forEach((item) => item.classList.remove("open"));
  });
};

const initLanguageOptions = () => {
  document.querySelectorAll("[data-lang-option]").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      applyLanguage(option.dataset.langOption);
      document
        .querySelectorAll(".dropdown.open")
        .forEach((item) => item.classList.remove("open"));
    });
  });
};

const initLogout = () => {
  document.querySelectorAll("[data-logout]").forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.removeItem("DEV AGS-auth");
    });
  });
};

const initPanelTabs = () => {
  const tabs = [...document.querySelectorAll("[data-panel-tab]")];
  const contents = [...document.querySelectorAll("[data-panel-content]")];

  if (!tabs.length) return;

  const activate = (target) => {
    tabs.forEach((tab) =>
      tab.classList.toggle("active", tab.dataset.panelTab === target),
    );
    contents.forEach((content) => {
      content.classList.toggle(
        "active",
        content.dataset.panelContent === target,
      );
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activate(tab.dataset.panelTab);
      history.replaceState(null, "", `#${tab.dataset.panelTab}`);
    });
  });

  const initial = window.location.hash.replace("#", "");
  activate(
    ["pages", "plans", "payments"].includes(initial) ? initial : "pages",
  );
};

const initApp = async () => {
  if (localStorage.getItem("DEV AGS-theme") === "light") {
    document.body.classList.add("light-mode");
  }

  await includePartials();

  renderLoggedNavigation();
  markActiveNavigation();
  initTheme();
  initPasswordToggles();
  initCarousel();
  initAuthForms();
  initDropdowns();
  initLanguageOptions();
  initLogout();
  initPanelTabs();
  applyLanguage(localStorage.getItem("DEV AGS-language") || "es");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
