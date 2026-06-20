import { useEffect } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../services/api";

export default function PublicPage() {
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;

    window.location.replace(`${API_URL}/${encodeURIComponent(slug)}`);
  }, [slug]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontSize: "18px",
      }}
    >
      Cargando dedicatoria...
    </div>
  );
}
