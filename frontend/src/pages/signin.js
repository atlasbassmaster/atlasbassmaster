import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

const Signin = () => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [activeTab, setActiveTab] = useState("participant");
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [toise, setToise] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateLetters = (value) => value.length === 0 || /^[A-Za-zÀ-ÿ]+$/.test(value);
  const validateToise = (value) =>
    value.length === 0 || (/^[0-9]*$/.test(value) && value > 0 && value < 151);
  const validatePhone = (value) =>
    value.length === 0 || (/^0[0-9]*$/.test(value) && value.length <= 10);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await axios.post("/signin", {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        toise_id: toise,
        code,
      });
      if (response.data.success) {
        sessionStorage.setItem("user__id", response.data.user.id);
        navigate("/catches");
      } else {
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
      const response = await axios.post("/auth/staff", { username, password });
      if (response.data.success) {
        sessionStorage.setItem("staff__id", response.data.staff.id);
        navigate("/users");
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
      const response = await axios.post("/auth/login", { toise_id: toise, code });
      if (response.data.success) {
        sessionStorage.setItem("user__id", response.data.user.id);
        navigate("/catches");
      } else {
        setErrorMessage("Connexion échouée. Vérifiez vos informations.");
      }
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleRequestError = (error) => {
    if (error.response) {
      setErrorMessage(error.response.data.message || "Erreur côté serveur.");
    } else if (error.request) {
      setErrorMessage("Aucune réponse du serveur.");
    } else {
      setErrorMessage("Une erreur inconnue est survenue.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      <div style={styles.card}>
        <img src="/logo.png" alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>Atlas Bass Master 🎣</h2>

        {/* Mode toggle */}
        <div style={styles.modeToggle}>
          <button
            style={{ ...styles.modeBtn, ...(isLoginMode ? {} : styles.modeBtnActive) }}
            onClick={() => { setIsLoginMode(false); setErrorMessage(""); }}
          >
            Inscription
          </button>
          <button
            style={{ ...styles.modeBtn, ...(isLoginMode ? styles.modeBtnActive : {}) }}
            onClick={() => { setIsLoginMode(true); setErrorMessage(""); }}
          >
            Connexion
          </button>
        </div>

        {!isLoginMode ? (
          <form onSubmit={handleSignup} style={styles.form}>
            <input type="text" placeholder="Prénom" value={firstName}
              onChange={(e) => validateLetters(e.target.value) && setFirstName(e.target.value)}
              required style={styles.input} />
            <input type="text" placeholder="Nom" value={lastName}
              onChange={(e) => validateLetters(e.target.value) && setLastName(e.target.value)}
              required style={styles.input} />
            <input type="text" inputMode="numeric" placeholder="Téléphone (0XXXXXXXXX)" value={phone}
              onChange={(e) => validatePhone(e.target.value) && setPhone(e.target.value)}
              required style={styles.input} />
            <input type="text" inputMode="numeric" placeholder="Numéro de toise" value={toise}
              onChange={(e) => validateToise(e.target.value) && setToise(e.target.value)}
              required style={styles.input} />
            <input type="text" placeholder="Code" value={code}
              onChange={(e) => setCode(e.target.value)}
              required style={styles.input} />
            <button type="submit" style={styles.button}>S'inscrire</button>
          </form>
        ) : (
          <>
            {/* Tab selector */}
            <div style={styles.tabBar}>
              <button
                style={{ ...styles.tab, ...(activeTab === "participant" ? styles.tabActive : {}) }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setActiveTab("participant"); setErrorMessage(""); }}
              >
                Participant
              </button>
              <button
                style={{ ...styles.tab, ...(activeTab === "jury" ? styles.tabActive : {}) }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setActiveTab("jury"); setErrorMessage(""); }}
              >
                Jury
              </button>
            </div>

            {activeTab === "participant" ? (
              <form onSubmit={handleParticipantLogin} style={styles.form}>
                <input type="text" inputMode="numeric" placeholder="Numéro de toise" value={toise}
                  onChange={(e) => setToise(e.target.value)} required style={styles.input} />
                <input type="text" placeholder="Code" value={code}
                  onChange={(e) => setCode(e.target.value)} required style={styles.input} />
                <button type="submit" style={styles.button}>Se connecter</button>
              </form>
            ) : (
              <form onSubmit={handleStaffLogin} style={styles.form}>
                <input type="text" placeholder="Nom d'utilisateur" value={username}
                  onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
                <input type="password" placeholder="Mot de passe" value={password}
                  onChange={(e) => setPassword(e.target.value)} required style={styles.input}
                  tabIndex="-1" onFocus={(e) => e.target.removeAttribute("tabindex")} />
                <button type="submit" style={styles.button}>Se connecter</button>
              </form>
            )}
          </>
        )}

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
    minHeight: "100vh",
    backgroundImage: "url('/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  card: {
    position: "relative",
    background: "#fff",
    padding: "32px 28px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    textAlign: "center",
    width: "340px",
    zIndex: 1,
  },
  logo: {
    width: "72px",
    marginBottom: "8px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1a1a2e",
    fontFamily: "'Segoe UI', sans-serif",
  },
  modeToggle: {
    display: "flex",
    background: "#f0f4f8",
    borderRadius: "8px",
    padding: "4px",
    marginBottom: "20px",
    gap: "4px",
  },
  modeBtn: {
    flex: 1,
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "transparent",
    color: "#666",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  modeBtnActive: {
    background: "#fff",
    color: "#1a1a2e",
    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
    fontWeight: "bold",
  },
  tabBar: {
    display: "flex",
    borderBottom: "2px solid #f0f4f8",
    marginBottom: "16px",
    gap: "0",
  },
  tab: {
    flex: 1,
    padding: "8px",
    border: "none",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    fontSize: "14px",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#1a1a2e",
    fontWeight: "bold",
    borderBottom: "2px solid #1a1a2e",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "11px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    transition: "border 0.2s",
    fontFamily: "'Segoe UI', sans-serif",
  },
  button: {
    background: "#1a1a2e",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    marginTop: "4px",
    transition: "opacity 0.2s",
  },
  error: {
    color: "#e53935",
    marginTop: "12px",
    fontSize: "13px",
    background: "#ffebee",
    padding: "8px 12px",
    borderRadius: "6px",
  },
};

export default Signin;
