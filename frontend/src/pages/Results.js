import { useState, useEffect } from "react";
import axios from "../services/api";

const Results = () => {
  const [competitors, setCompetitors] = useState([]);

  useEffect(() => {
    axios.get("/results")
      .then(response => setCompetitors(response.data.competitors))
      .catch(error => console.error("Erreur :", error));
  }, []);

  return (
    <div>
      <h2>Résultats</h2>
      <ul>
        {competitors.map((competitor, index) => (
          <li key={index}>
            #{index + 1} {competitor.name} - {competitor.totalPoints} pts
            <ul>{competitor.biggestCatches.map((fish, i) => <li key={i}>🐟 {fish.length} cm</li>)}</ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
