import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

const Login = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [toise, setToise] = useState(""); // Nouveau champ Numéro de toise
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { name, phone, toise });
      if (response.data.success) {
        navigate("/catches");
      } else {
        alert("Échec de connexion");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div> {/* Overlay pour améliorer la visibilité */}
      <div style={styles.card}>
        <img src="/logo.png" alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>Bienvenue sur Atlas Bass Master 🎣</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Numéro de toise"  // Nouveau champ ajouté ici
            value={toise}
            onChange={(e) => setToise(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Se connecter</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: "url('/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    position: "relative",
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "350px",
    zIndex: 1,
  },
  logo: {
    width: "80px",
    marginBottom: "10px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "22px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    background: "#007BFF",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    transition: "background 0.3s",
  },
};

export default Login;
