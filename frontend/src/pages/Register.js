import React, { useState } from 'react';
import api from '../services/api';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    toiseNumber: '',
    secretCode: '',
    fullName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation frontale
    const newErrors = {};
    if (!formData.toiseNumber) newErrors.toiseNumber = "Requis";
    if (!formData.secretCode) newErrors.secretCode = "Requis";
    if (!formData.fullName) newErrors.fullName = "Requis";
    if (!formData.phone) newErrors.phone = "Requis";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);
      alert(`Enregistrement réussi! Bienvenue ${response.data.user.fullName}`);
      // Redirection vers login...
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || "Erreur d'enregistrement" });
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Enregistrement Compétiteur</h2>
        
        <div className="form-group">
          <label>Numéro de toise (1-150)</label>
          <input
            type="number"
            min="1"
            max="150"
            value={formData.toiseNumber}
            onChange={(e) => setFormData({...formData, toiseNumber: e.target.value})}
            className={errors.toiseNumber ? 'error' : ''}
          />
          {errors.toiseNumber && <span className="error-message">{errors.toiseNumber}</span>}
        </div>

        <div className="form-group">
          <label>Code secret (4 chiffres)</label>
          <input
            type="password"
            pattern="\d{4}"
            maxLength="4"
            value={formData.secretCode}
            onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
            className={errors.secretCode ? 'error' : ''}
          />
          {errors.secretCode && <span className="error-message">{errors.secretCode}</span>}
        </div>

        <div className="form-group">
          <label>Nom complet</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className={errors.fullName ? 'error' : ''}
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        {errors.submit && <div className="submit-error">{errors.submit}</div>}

        <button type="submit" className="submit-btn">
          S'enregistrer
        </button>
      </form>
    </div>
  );
}