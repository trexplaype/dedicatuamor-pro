import { useEffect, useState } from "react";
import {
  FaHeart,
  FaBirthdayCake,
  FaGift,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import { GiDiamondRing } from "react-icons/gi";
import { IoPlayCircle } from "react-icons/io5";

import Button from "../components/Button";
import TemplateCard from "../components/TemplateCard";
import SubscriptionPlans from "../components/SubscriptionPlans";

import { getTemplates } from "../services/templateService";
import { getRewardTasks } from "../services/rewardTaskService";

const categories = [
  { icon: <FaHeart />, title: "Amor", text: "Para tu persona especial" },
  {
    icon: <FaCalendarDays />,
    title: "Aniversario",
    text: "Celebra cada recuerdo",
  },
  {
    icon: <FaBirthdayCake />,
    title: "Cumpleaños",
    text: "Haz su día especial",
  },
  { icon: <GiDiamondRing />, title: "Propuestas", text: "El momento perfecto" },
  { icon: <FaGift />, title: "Sorpresas", text: "Detalles que enamoran" },
  { icon: <FaEnvelope />, title: "Cartas", text: "Palabras que llegan" },
];

function normalizeTemplates(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.templates)) return data.templates;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [rewardTasks, setRewardTasks] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const templatesPerView = 4;
  const maxIndex = Math.max(featuredTemplates.length - templatesPerView, 0);

  useEffect(() => {
    loadFeaturedTemplates();
    loadRewards();
  }, []);

  const loadFeaturedTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await getTemplates();
      setFeaturedTemplates(normalizeTemplates(data));
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error cargando plantillas:", error);
      setFeaturedTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadRewards = async () => {
    try {
      const data = await getRewardTasks();
      setRewardTasks(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error("Error cargando recompensas:", error);
      setRewardTasks([]);
    }
  };

  const nextTemplates = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prevTemplates = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const goToTemplate = (index) => setCurrentIndex(Math.min(index, maxIndex));

  const visibleTemplates = featuredTemplates.slice(
    currentIndex,
    currentIndex + templatesPerView,
  );

  const getRewardIcon = (type) => {
    if (type === "whatsapp_invite") return <FaWhatsapp />;
    return <IoPlayCircle />;
  };

  const getRewardTitle = (reward) => {
    if (reward.type === "whatsapp_invite") {
      return `Invitar ${reward.target_count} amigos diarios`;
    }

    return `Mirar ${reward.target_count} anuncios`;
  };

  const getRewardText = (reward) => {
    if (reward.type === "whatsapp_invite") {
      return `Invita amigos por WhatsApp y gana +${reward.reward_coins} monedas.`;
    }

    return `Mira anuncios completos y gana +${reward.reward_coins} monedas.`;
  };

  return (
    <main className="home-modern panda-home">
      <section className="panda-hero" id="inicio">
        <div className="panda-hero-content">
          <span className="panda-badge">Crea momentos inolvidables 💖</span>

          <h1>
            Convierte tus sentimientos en <span>algo inolvidable 💖</span>
          </h1>

          <p>
            Páginas únicas con fotos, música, videos y mensajes que harán latir
            su corazón.
          </p>

          <div className="panda-actions">
            <Button to="/templates">✨ Crear mi dedicatoria</Button>
            <Button to="/templates" variant="secondary">
              🎨 Ver plantillas
            </Button>
          </div>

          <div className="panda-mini-list">
            <span>⚡ Fácil de usar</span>
            <span>💖 100% Personalizable</span>
            <span>⏱️ Listo en minutos</span>
            <span>🚀 Comparte con amor</span>
          </div>
        </div>

        <div className="panda-hero-image">
          <img src="/design/panda-love.png" alt="Panda DEV AGS" />
        </div>
      </section>

      <section className="love-categories">
        {categories.map((item) => (
          <article key={item.title} className="love-category">
            <span className="love-category-icon">{item.icon}</span>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="templates-new panda-section" id="plantillas">
        <div className="templates-new-top">
          <div>
            <p className="section-mini">🐼 NUESTRA COLECCIÓN</p>
            <h2>Plantillas Destacadas</h2>
          </div>

          <Button to="/templates" variant="secondary">
            Ver Todas →
          </Button>
        </div>

        {loadingTemplates ? (
          <div className="templates-empty-box">Cargando plantillas...</div>
        ) : visibleTemplates.length === 0 ? (
          <div className="templates-empty-box">
            Aún no hay plantillas disponibles.
          </div>
        ) : (
          <>
            <div
              className="templates-slider-wrapper templates-slider-clean"
              onWheel={(e) => {
                e.preventDefault();
                if (e.deltaY > 0 || e.deltaX > 0) nextTemplates();
                else prevTemplates();
              }}
            >
              <button
                type="button"
                className="slider-arrow"
                onClick={prevTemplates}
                disabled={currentIndex === 0}
              >
                ‹
              </button>

              <div className="templates-clean-grid">
                {visibleTemplates.map((template) => (
                  <div key={template.id} className="template-clean-item">
                    <TemplateCard template={template} />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="slider-arrow"
                onClick={nextTemplates}
                disabled={currentIndex >= maxIndex}
              >
                ›
              </button>
            </div>

            <div className="slider-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === currentIndex ? "active" : ""}
                  onClick={() => goToTemplate(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panda-how" id="como-funciona">
        <div className="panda-section-title">
          <h2>🐼 ¿Cómo funciona?</h2>
        </div>

        <div className="panda-steps">
          <article>
            <img src="/design/panda-step-1.png" alt="Elige plantilla" />
            <span>1</span>
            <h3>Elige tu plantilla</h3>
            <p>Escoge el diseño que más te guste.</p>
          </article>

          <article>
            <img src="/design/panda-step-2.png" alt="Personaliza" />
            <span>2</span>
            <h3>Personaliza</h3>
            <p>Agrega fotos, música, mensajes y más.</p>
          </article>

          <article>
            <img src="/design/panda-step-3.png" alt="Comparte" />
            <span>3</span>
            <h3>Comparte tu amor</h3>
            <p>Envía tu dedicatoria y haz feliz a esa persona.</p>
          </article>
        </div>
      </section>

      <section className="panda-rewards">
        <div className="panda-section-title left">
          <h2>🪙 Gana monedas gratis</h2>
        </div>

        <div className="reward-home-grid">
          {rewardTasks.map((reward) => (
            <article key={reward.id} className="reward-home-card">
              <div className="reward-home-icon liquid-icon">
                {getRewardIcon(reward.type)}
              </div>

              <h3>{getRewardTitle(reward)}</h3>
              <p>{getRewardText(reward)}</p>

              <Button to="/rewards">
                {reward.type === "whatsapp_invite" ? "Invitar" : "Ver anuncio"}
              </Button>
            </article>
          ))}

          <div className="reward-panda">
            <img src="/design/panda-coins.png" alt="Panda con monedas" />
          </div>
        </div>
      </section>

      <section className="plans-section panda-section" id="planes">
        <div className="section-heading centered">
          <p className="eyebrow">👑 Planes Premium</p>
          <h2>Elige el plan ideal para ti 💖</h2>
          <p>Compra monedas de oro y úsalas para desbloquear planes premium.</p>
        </div>

        <SubscriptionPlans />
      </section>

      <section className="final-cta panda-final">
        <div className="final-cta-box">
          <div>
            <h2>🐼 ¿Listo para crear algo inolvidable?</h2>
            <p>
              Únete a miles de personas que crean momentos únicos con DEV AGS.
            </p>
          </div>

          <Button to="/templates">Crear mi dedicatoria 💖</Button>
        </div>
      </section>
    </main>
  );
}
