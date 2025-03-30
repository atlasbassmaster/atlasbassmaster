import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";


const Signin = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [toise, setToise] = useState(""); // Nouveau champ Numéro de toise
  const [code, setCode] = useState(""); // Nouveau champ Numéro de toise
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateLetters = (value) => {
    return /^[A-Za-z]+$/.test(value);
  };

  // Function to validate only numbers for other fields
  const validateNumbers = (value) => {
    return /^[0-9]*$/.test(value);
  };

    const validatetToise = (value) => {
      return value.length == 0  |  (/^[0-9]*$/.test(value) &&  (value > 0 && (value < 151))); };


    const validatePhoneNumber = (value) => {
      const cleanedValue = value;
      if (cleanedValue.length > 10) return false; // Limit length to 10 digits max

      // Check if it starts with "06" or "07"
      return cleanedValue.length <= 10 && (( cleanedValue.length == 1 && cleanedValue.startsWith("0") )|| cleanedValue.startsWith("06") || cleanedValue.startsWith("07"));
    };
  const handleLogin = async (e) => {

    e.preventDefault();
    setErrorMessage(""); // Reset error message before a new request
    try {
      const response = await axios.post("/signin", {
        first_name: firstName,  // Rename to match backend
        last_name: lastName,
        phone_number: phone,
        toise_id: toise,
        code: code,
    });
      if (response.data.success) {
        navigate("/catches");
      } else {
        setErrorMessage("Échec de connexion. Vérifiez vos informations.");
      }
    } catch (error) {
     if (error.response) {
           // Server responded with an error status
           setErrorMessage(error.response.data.message || "Erreur lors de la connexion.");
         } else if (error.request) {
           // Request was made but no response received
           setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
         } else {
           // Other errors
           setErrorMessage("Une erreur inconnue est survenue.");
         }
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
            placeholder="Prénom"
            value={firstName}
             onChange={(e) => {
                          if (validateLetters(e.target.value)) {
                            setFirstName(e.target.value);
                          }
                        }}
            required
            style={styles.input}
          />
                    <input
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                       onChange={(e) => {
                                    if (validateLetters(e.target.value)) {
                                      setLastName(e.target.value);
                                    }
                                  }}
                      required
                      style={styles.input}
                    />
          <input
            type="text"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => {

              if (validatePhoneNumber(e.target.value) || e.target.value === "") {
                setPhone(e.target.value);
              }
            }}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Numéro de toise"  // Nouveau champ ajouté ici
            value={toise}
                        onChange={(e) => {
                          if (validatetToise(e.target.value)) {
                            setToise(e.target.value);
                          }
                        }}
            required
            style={styles.input}
          />
                    <input
                      type="text"
                      placeholder="Code"  // Nouveau champ ajouté ici
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      style={styles.input}
                    />
          <button type="submit" style={styles.button}>Se connecter</button>
        </form>
        {/* Display error message */}
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
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
  error: {
    color: "red",
    marginTop: "10px",
    fontSize: "14px",
  },
};

export default Signin;
