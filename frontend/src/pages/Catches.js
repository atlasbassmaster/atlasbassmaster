import React, { useState } from 'react';
import api from '../services/api';

export default function Catches() {
  const [length, setLength] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/catches', { length: parseFloat(length) });
      setLength('');
      setError('');
      alert('Prise enregistrée avec succès !');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="catches-form">
      <h2>Enregistrer une prise</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="Longueur (cm)"
          min="30"
          step="0.1"
          required
        />
        <button type="submit">Valider</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}