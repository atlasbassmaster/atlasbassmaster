import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import "../Styles/Catches.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Signin = () => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [toise, setToise] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateLetters = (value) => /^[A-Za-z]+$/.test(value);
  const validateNumbers = (value) => /^[0-9]*$/.test(value);

  const validatetToise = (value) =>
    value.length === 0 || (/^[0-9]*$/.test(value) && value > 0 && value < 151);

  const validatePhoneNumber = (value) => {
    const cleanedValue = value;
    if (cleanedValue.length > 10) return false;
    return (
      cleanedValue.length <= 10 &&
      ((cleanedValue.length === 1 && cleanedValue.startsWith("0")) ||
        cleanedValue.startsWith("06") ||
        cleanedValue.startsWith("07"))
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");




    try {
      const response = await axios.post("/signin", {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        toise_id: toise,
        code: code,
      });

      if (response.data.success) {
        sessionStorage.setItem("user__id", response.data.user.id);
        navigate("/catches");
      } else {
       console.log("UUUU");
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      handleRequestError(error);
    }
  };



  const handleStaffLogin = async (e) => {
  e.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post("/auth/staff", {
        username,
        password,
      });

      if (response.data.success) {
      console.log(response.data);
       // sessionStorage.setItem("staff__id", response.data.user.id);
       // console.log(sessionStorage.getItem("user__id"));
        navigate("/catches");
      } else {
        setErrorMessage("Connexion échouée. Vérifiez vos informations.");
      }
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleParticipantLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post("/auth/login", {
        toise_id:toise,
        code,
      });

      if (response.data.success) {
        sessionStorage.setItem("user__id", response.data.user.id);
        console.log("UUUU");
        console.log(sessionStorage.getItem("user__id"));
        navigate("/catches");
      } else {
      console.log("UUUU");
        setErrorMessage("Connexion échouée. Vérifiez vos informations.");
      }
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleRequestError = (error) => {
    console.log(error);
    if (error.response) {
      setErrorMessage(error.response.data.message || "Erreur côté serveur.");
    } else if (error.request) {
      setErrorMessage("Aucune réponse du serveur.");
    } else {
      setErrorMessage("Une erreur inconnue est survenue.");
    }
    console.error("Erreur de requête :", error);
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        <img src="/logo.png" alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>Bienvenue sur Atlas Bass Master 🎣</h2>

        {!isLoginMode ? (
          <form onSubmit={handleSignup} style={styles.form}>
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => validateLetters(e.target.value) && setFirstName(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => validateLetters(e.target.value) && setLastName(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Téléphone"
              value={phone}
              onChange={(e) =>
                (validatePhoneNumber(e.target.value) || e.target.value === "") && setPhone(e.target.value)
              }
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Numéro de toise"
              value={toise}
              onChange={(e) => validatetToise(e.target.value) && setToise(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>S'inscrire</button>
          </form>
        ) : (
<Tabs>
  <TabList>
    <Tab>Participant</Tab>
    <Tab>Staff</Tab>
  </TabList>

  <TabPanel>
    {/* Participant Login Form */}
    <form onSubmit={handleParticipantLogin}>
      <input
        type="text"
        placeholder="Numéro de toise"
        value={toise}
        onChange={(e) => setToise(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  </TabPanel>

  <TabPanel>
    {/* Staff Login Form */}
    <form onSubmit={handleStaffLogin}>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  </TabPanel>
</Tabs>

        )}

        <p
          onClick={() => setIsLoginMode(!isLoginMode)}
          style={{ marginTop: 16, color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
        >
          {isLoginMode ? "Retour à l'inscription" : "J'ai déjà un compte"}
        </p>

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
