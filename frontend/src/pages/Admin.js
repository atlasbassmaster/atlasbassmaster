import { useState, useEffect } from "react";
import axios from "../services/api";

const Admin = () => {
  const [isCatchesEnabled, setIsCatchesEnabled] = useState(false);

  useEffect(() => {
    axios.get("/admin/catches-status")
      .then(response => setIsCatchesEnabled(response.data.enabled))
      .catch(error => console.error("Erreur :", error));
  }, []);

  const toggleCatches = () => {
    axios.post("/admin/toggle-catches", { enabled: !isCatchesEnabled })
      .then(response => setIsCatchesEnabled(response.data.enabled))
      .catch(error => console.error("Erreur :", error));
  };

  return (
    <div>
      <h2>Gestion de la Saisie des Prises</h2>
      <p>Statut : {isCatchesEnabled ? "✅ Activé" : "❌ Désactivé"}</p>
      <button onClick={toggleCatches}>
        {isCatchesEnabled ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
};

export default Admin;
