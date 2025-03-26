import { useState, useEffect } from "react";
import axios from "../services/api";

const Catches = () => {
  const [catches, setCatches] = useState([]);
  const [fishLength, setFishLength] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios.get("/catches/my-catches")
      .then(response => setCatches(response.data.catches))
      .catch(error => console.error("Erreur :", error));
  }, []);

  const handleAddCatch = () => {
    const length = parseFloat(fishLength);
    if (length < 30) {
      setErrorMessage("❌ Longueur minimale : 30 cm");
      return;
    }

    axios.post("/catches", { length })
      .then(response => {
        setCatches(response.data.catches);
        setErrorMessage("");
        setFishLength("");
      })
      .catch(error => console.error("Erreur :", error));
  };

  return (
    <div>
      <h2>Enregistrement des Prises</h2>
      <input type="number" placeholder="Longueur (cm)" value={fishLength} onChange={(e) => setFishLength(e.target.value)} />
      <button onClick={handleAddCatch} disabled={catches.length >= 5}>Ajouter</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <h3>Vos Prises ({catches.length}/5)</h3>
      <ul>{catches.map((fish, i) => <li key={i}>🐟 {fish.length} cm</li>)}</ul>
    </div>
  );
};

export default Catches;
