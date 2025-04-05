import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Ranking() {
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await api.get('/catches/my-ranking');
        setRanking(response.data);
      } catch (err) {
        console.error("Erreur:", err);
      }
    };
    
    fetchRanking();
    const interval = setInterval(fetchRanking, 30000); // Rafraîchissement auto toutes les 30s
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ranking">
      <h2>Votre Classement</h2>
      
      {ranking ? (
        <>
          <div className="total-points">
            <h3>Total Points: <span>{ranking.totalPoints}</span></h3>
          </div>
          
          <h4>Vos 5 meilleures prises:</h4>
          <ul className="catches-list">
            {ranking.catches.map((catchItem, index) => (
              <li key={index}>
                {catchItem.length} cm → {catchItem.points} points
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Chargement en cours...</p>
      )}
    </div>
  );
}