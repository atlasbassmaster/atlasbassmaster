import { useState, useEffect } from "react";
import axios from "../services/api";

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    axios.get("/ranking")
      .then(response => setRanking(response.data))
      .catch(error => console.error("Erreur :", error));
  }, []);

  return (
    <div>
      <h2>Classement</h2>
      <ul>
        {ranking.map((competitor, index) => (
          <li key={index}>#{index + 1} {competitor.name} - {competitor.totalPoints} pts</li>
        ))}
      </ul>
    </div>
  );
};

export default Ranking;
