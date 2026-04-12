import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

const Catches = () => {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [catches, setCatches] = useState([]);
  const [fishLength, setFishLength] = useState("30");
  const [rankings, setRankings] = useState({ rank: 0, points: 0, total_users: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editCatchId, setEditCatchId] = useState(null);
  const [editLength, setEditLength] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const user_id = sessionStorage.getItem("user__id");

  useEffect(() => {
    const fetchFeatureState = async () => {
      try {
        const response = await axios.get("/api/state");
        setIsFeatureEnabled(response.data.enabled);
      } catch {
        setIsFeatureEnabled(false);
      }
    };
    fetchFeatureState();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/catches/rankings/" + user_id);
      if (response.data.rankings) setRankings(response.data.rankings);
    } catch (error) {
      console.error("Erreur fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get("/catches/user/" + user_id)
      .then((response) => setCatches(response.data))
      .catch((error) => console.error("Erreur :", error));
  }, [user_id]);

  useEffect(() => {
    fetchRanking();
  }, [user_id]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const regex = /^-?\d*(\.\d*)?$/;
    if (value.length === 0 || (regex.test(value) && parseFloat(value) % 0.5 === 0)) {
      setFishLength(value);
    }
  };

  const handleAddCatch = () => {
    const lengthValue = parseFloat(fishLength);
    if (lengthValue < 30 || lengthValue > 70) {
      alert("❌ Longueur minimale : 30 cm");
      return;
    }
    axios.post("/catches", { length: lengthValue, user_id })
      .then((response) => {
        setCatches(response.data.catches);
        setErrorMessage("");
        setFishLength("30");
        fetchRanking();
      })
      .catch((error) => console.error("Erreur :", error));
  };

  const handleEdit = (catchItem) => {
    setEditCatchId(catchItem.id);
    setEditLength(catchItem.length);
  };

  const handleEditSubmit = (catchId) => {
    const newLength = parseFloat(editLength);
    if (newLength < 30 || newLength > 70) {
      setErrorMessage("❌ Longueur minimale : 30 cm");
      return;
    }
    axios.put(`/catches/${catchId}`, { length: newLength, toise_id: catchId })
      .then((response) => {
        const updatedCatch = response.data.catch;
        setCatches(catches.map((item) => (item.id === catchId ? updatedCatch : item)));
        setEditCatchId(null);
        setEditLength("");
        setErrorMessage("");
        fetchRanking();
      })
      .catch((error) => console.error("Error updating catch:", error));
  };

  const deleteCatch = async (catchId) => {
    try {
      await axios.delete(`/catches/${catchId}`, { data: { userId: user_id, catchId } });
      setCatches(catches.filter((c) => c.id !== catchId));
      fetchRanking();
    } catch (error) {
      console.error("Error deleting catch:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user__id");
    navigate("/");
  };

  const isButtonDisabled =
    !isFeatureEnabled ||
    parseFloat(fishLength) < 30 ||
    parseFloat(fishLength) > 70 ||
    parseFloat(fishLength) % 0.5 !== 0;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/logo.png" alt="Logo" style={styles.headerLogo} />
          <span style={styles.headerTitle}>Atlas Bass Master</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
      </div>

      <div style={{ ...styles.container, flexDirection: isMobile ? "column" : "row" }}>
        {/* Left column */}
        <div style={styles.leftColumn}>
          <div style={styles.rankCard}>
            {loading ? (
              <p style={{ color: "#aaa" }}>Chargement...</p>
            ) : (
              <>
                <div style={styles.rankNumber}>#{rankings.rank}</div>
                <div style={styles.rankLabel}>sur {rankings.total_users} participants</div>
                <div style={styles.rankPoints}>{rankings.points} pts</div>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Enregistrer une prise</h3>
            <div style={styles.lengthDisplay}>{fishLength} cm</div>
            <input
              type="range"
              min="30"
              max="70"
              step="0.5"
              value={fishLength}
              onChange={handleInputChange}
              style={styles.slider}
            />
            <div style={styles.sliderLabels}>
              <span>30 cm</span>
              <span>70 cm</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ou saisir manuellement"
              value={fishLength}
              onChange={handleInputChange}
              style={styles.input}
            />
            <button
              onClick={handleAddCatch}
              disabled={isButtonDisabled}
              style={{ ...styles.addButton, opacity: isButtonDisabled ? 0.5 : 1, cursor: isButtonDisabled ? "not-allowed" : "pointer" }}
            >
              + Ajouter
            </button>
            {!isFeatureEnabled && (
              <p style={styles.disabledMsg}>La saisie est désactivée</p>
            )}
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
          </div>
        </div>

        {/* Right column */}
        <div style={styles.rightColumn}>
          <h3 style={styles.sectionTitle}>
            Vos prises
            <span style={styles.catchCount}>{catches.length}/5</span>
          </h3>
          {catches.length === 0 ? (
            <div style={styles.emptyState}>
              <p>🎣 Aucune prise enregistrée</p>
            </div>
          ) : (
            <div style={styles.catchList}>
              {catches.map((catchItem, index) => (
                <div key={catchItem.id} style={styles.catchRow}>
                  <div style={styles.catchIndex}>#{index + 1}</div>
                  {editCatchId === catchItem.id ? (
                    <div style={styles.editRow}>
                      <select
                        value={editLength}
                        onChange={(e) => setEditLength(e.target.value)}
                        style={styles.select}
                      >
                        {Array.from({ length: ((70 - 30) / 0.5) + 1 }, (_, i) => {
                          const value = (30 + i * 0.5).toFixed(1);
                          return <option key={value} value={value}>{value} cm</option>;
                        })}
                      </select>
                      <button onClick={() => handleEditSubmit(catchItem.id)} style={styles.saveBtn}>✓</button>
                      <button onClick={() => setEditCatchId(null)} style={styles.cancelBtn}>✕</button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.catchInfo}>
                        <span style={styles.catchLength}>{catchItem.length} cm</span>
                        <span style={styles.catchDate}>
                          {new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          }).format(new Date(catchItem.created_at))}
                        </span>
                      </div>
                      {isFeatureEnabled && (
                        <div style={styles.catchActions}>
                          <button onClick={() => handleEdit(catchItem)} style={styles.editBtn}>✎</button>
                          <button onClick={() => deleteCatch(catchItem.id)} style={styles.deleteBtn}>🗑</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f4f8",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    background: "#1a1a2e",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerLogo: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "18px",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
  },
  container: {
    display: "flex",
    gap: "20px",
    padding: "24px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  leftColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rightColumn: {
    flex: 2,
  },
  rankCard: {
    background: "#1a1a2e",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    color: "#fff",
  },
  rankNumber: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#f0c040",
  },
  rankLabel: {
    fontSize: "14px",
    color: "#aaa",
    marginTop: "4px",
  },
  rankPoints: {
    fontSize: "22px",
    fontWeight: "bold",
    marginTop: "8px",
    color: "#7ed6a0",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catchCount: {
    background: "#e3f2fd",
    color: "#1976d2",
    borderRadius: "12px",
    padding: "2px 10px",
    fontSize: "13px",
  },
  lengthDisplay: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "8px 0",
  },
  slider: {
    width: "100%",
    accentColor: "#1a1a2e",
    margin: "8px 0",
  },
  sliderLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#999",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "12px",
    textAlign: "center",
  },
  addButton: {
    width: "100%",
    padding: "12px",
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  disabledMsg: {
    color: "#e53935",
    fontSize: "13px",
    marginTop: "8px",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "8px",
  },
  catchList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  catchRow: {
    background: "#fff",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  catchIndex: {
    fontSize: "13px",
    color: "#aaa",
    width: "24px",
    flexShrink: 0,
  },
  catchInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  catchLength: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  catchDate: {
    fontSize: "12px",
    color: "#999",
  },
  catchActions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    background: "#e3f2fd",
    color: "#1976d2",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "15px",
  },
  deleteBtn: {
    background: "#ffebee",
    color: "#e53935",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "15px",
  },
  editRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  select: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  saveBtn: {
    background: "#e8f5e9",
    color: "#388e3c",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    background: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  emptyState: {
    background: "#fff",
    borderRadius: "10px",
    padding: "40px",
    textAlign: "center",
    color: "#aaa",
    fontSize: "16px",
  },
};

export default Catches;
