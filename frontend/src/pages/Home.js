import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

export default function Home() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    toiseNumber: '',
    secretCode: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation commune
    if (!formData.toiseNumber || !formData.secretCode) {
      setError('Toise et code requis');
      return;
    }

    if (!isLoginMode && (!formData.fullName || !formData.phone)) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, {
        toiseNumber: formData.toiseNumber,
        secretCode: formData.secretCode,
        ...(!isLoginMode && {
          fullName: formData.fullName,
          phone: formData.phone
        })
      });

      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'authentification");
    }
  };

  return (
    <div className="home-container">
      <h1>{isLoginMode ? 'Connexion' : 'Enregistrement'}</h1>
      
      <form onSubmit={handleSubmit}>
        {!isLoginMode && (
          <>
            <div className="form-group">
              <label>Nom Complet</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Numéro de Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Numéro de Toise (1-150)</label>
          <input
            type="number"
            min="1"
            max="150"
            value={formData.toiseNumber}
            onChange={(e) => setFormData({...formData, toiseNumber: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Code Secret</label>
          <input
            type="password"
            pattern="\d{4}"
            maxLength="4"
            value={formData.secretCode}
            onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn">
          {isLoginMode ? 'Se connecter' : "S'enregistrer"}
        </button>

        <button 
          type="button" 
          className="switch-mode-btn"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError('');
          }}
        >
          {isLoginMode 
            ? "Nouveau compétiteur ? S'enregistrer" 
            : "Déjà enregistré ? Se connecter"}
        </button>
      </form>
    </div>
  );
}