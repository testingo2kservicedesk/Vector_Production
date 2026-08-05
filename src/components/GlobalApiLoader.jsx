import { useEffect, useState } from "react";
import "./GlobalApiLoader.css";

export default function GlobalApiLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const update = (event) => setLoading(Boolean(event.detail?.loading));
    window.addEventListener("vector:api-loading", update);
    return () => window.removeEventListener("vector:api-loading", update);
  }, []);

  if (!loading) return null;
  return <div className="global-api-loader" role="status" aria-live="polite" aria-label="Loading"><span /></div>;
}
