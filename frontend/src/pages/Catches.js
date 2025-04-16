import { useState, useEffect } from "react";
import axios from "../services/api";

const Catches = () => {
  const [catches, setCatches] = useState([]);
  const [fishLength, setFishLength] = useState("30");
  const [rankings, setRankings] = useState({
    rank: 0,
    points: 0,
    total_users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // States for editing a catch:
  const [editCatchId, setEditCatchId] = useState(null);
  const [editLength, setEditLength] = useState("");

  const user_id = sessionStorage.getItem("user__id");

  const [isMobile, setIsMobile] = useState(false);

  // Detect screen width changes for responsiveness.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validateNumbers = (value) => /^[0-9]*$/.test(value);
  const validateLength = (value) => {
    console.log("Length validation", value % 0.5);
    return value % 0.5 === 0;
  };

  const handleInputChange = (e) => {
    console.log("Input change validation");
    const value = e.target.value;
    const regex = /^-?\d*(\.\d*)?$/;
    if (regex.test(value) && (parseFloat(value) % 0.5 === 0)) {
      setFishLength(value);
    }
  };

  // Function to fetch ranking data
  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/catches/rankings/" + user_id);
      console.log(response.data.rankings);
      if (response.data.rankings) {
        setRankings(response.data.rankings);
      }
    } catch (error) {
      console.error("Erreur fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's catches on mount
  useEffect(() => {
    axios
      .get("/catches/user/" + user_id)
      .then((response) => setCatches(response.data))
      .catch((error) => console.error("Erreur :", error));
  }, [user_id]);

  // Fetch ranking data on mount
  useEffect(() => {
    fetchRanking();
  }, [user_id]);

  const handleAddCatch = () => {
    const lengthValue = parseFloat(fishLength);
    if (lengthValue < 30) {
      alert("❌ Longueur minimale : 30 cm");
      return;
    }
    axios
      .post("/catches", { length: lengthValue, user_id })
      .then((response) => {
        setCatches(response.data.catches);
        setErrorMessage("");
        setFishLength("30");
        // After adding a catch, update the ranking.
        fetchRanking();
      })
      .catch((error) => console.error("Erreur :", error));
  };

  // Prepare to edit a catch: load its current length into state.
  const handleEdit = (catchItem) => {
    setEditCatchId(catchItem.id);
    setEditLength(catchItem.length);
  };

  // Submit the updated length via PUT request.
  const handleEditSubmit = (catchId) => {
    const newLength = parseFloat(editLength);
    if (newLength < 30) {
      setErrorMessage("❌ Longueur minimale : 30 cm");
      return;
    }
    axios
      .put(`/catches/${catchId}`, { length: newLength, toise_id: catchId })
      .then((response) => {
        const updatedCatch = response.data.catch;
        setCatches(catches.map(item => item.id === catchId ? updatedCatch : item));
        setEditCatchId(null);
        setEditLength("");
        setErrorMessage("");
        // After editing a catch, update the ranking.
        fetchRanking();
      })
      .catch((error) => console.error("Error updating catch:", error));
  };

  const deleteCatch = async (catchId) => {
    try {
      await axios.delete(`/catches/${catchId}`, {
        data: { userId: user_id, catchId },
      });
      setCatches(catches.filter((catchItem) => catchItem.id !== catchId));
      // After deleting a catch, update the ranking.
      fetchRanking();
    } catch (error) {
      console.error("Error deleting catch:", error);
      alert("Failed to delete the catch.");
    }
  };

  return (
    <div style={{ ...styles.container, flexDirection: isMobile ? "column" : "row" }}>
      <div style={{ ...styles.leftColumn, marginBottom: isMobile ? "20px" : "0" }}>
        <h2>Enregistrement des Prises</h2>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Longueur (cm)"
          min="30"
          step="0.5"
          style={styles.input}
          value={fishLength}
          onChange={handleInputChange}
        />
        <div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="0.5"
                  placeholder="Longueur (cm)"
                  style={styles.input}
                  value={fishLength}
                  onChange={handleInputChange}
                /></div>
                <div>{fishLength} cm</div>
                <div>  </div>
        <button
          onClick={handleAddCatch}
          disabled={parseFloat(fishLength) < 30 || parseFloat(fishLength) / 0.5 === 0}
                style={{
                  ...styles.button,
                  background: (parseFloat(fishLength) < 30 || parseFloat(fishLength) / 0.5 === 0)
                    ? "#AAAAAA"
                    : styles.editButton.background,
                  cursor: (parseFloat(fishLength) < 30 || parseFloat(fishLength) / 0.5 === 0)
                    ? "not-allowed"
                    : styles.editButton.cursor,
                }}
        >
          Ajouter
        </button>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}

        <div style={{ color: "black", marginTop: "20px" }}>
          {loading ? (
            <p>Loading ranking...</p>
          ) : (
            <>
              <h2>
                Classement : {rankings.rank} / {rankings.total_users}
              </h2>
              <p>
                <strong>Points:</strong> {rankings.points}
              </p>
            </>
          )}
        </div>
      </div>

      <div style={styles.rightColumn}>
        <h3>Vos Prises ({catches.length}/5)</h3>
        <div style={styles.catchList}>
          {catches.map((catchItem) => (
            <div key={catchItem.id} style={styles.catchRow}>
              {editCatchId === catchItem.id ? (
                <>

                  <select
                    value={editLength}
                                     onChange={(e) => setEditLength(e.target.value)}
                                        style={{ ...styles.input, width: "100px",  height: "(0px"}}
                  >
                    {Array.from({ length: ((70 - 30) / 0.5) + 1 }, (_, i) => {
                      const value = (30 + i * 0.5).toFixed(1); // keeps the value as a string with one decimal place
                      return (
                        <option key={value} value={value}>
                          {value} cm
                        </option>
                      );
                    })}
                  </select>

                  <button onClick={() => handleEditSubmit(catchItem.id)} style={styles.editButton}>
                    Save
                  </button>
                  <button onClick={() => setEditCatchId(null)} style={styles.cancelButton}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={styles.catchInfo}>
                    <p>
                      <strong>Longueur:</strong> {catchItem.length} cm
                    </p>
                    <p>
                      <strong>Date:</strong> {catchItem.created_at}
                    </p>
                  </div>
                  <div>
                    <button onClick={() => handleEdit(catchItem)} style={styles.editButton}>
                      Edit
                    </button>
                    <button onClick={() => deleteCatch(catchItem.id)} style={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  leftColumn: {
    flex: 1,
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px",
    textAlign: "center",
  },
  rightColumn: {
    flex: 2,
    padding: "20px",
    background: "#e3f2fd",
    borderRadius: "8px",
  },
  input: {
    padding: "10px",
    width: "80%",
    marginBottom: "10px",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px",
    background: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  catchList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  catchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "grey",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    flexWrap: "wrap", // Allows elements to wrap on smaller screens
  },
  catchInfo: {
    flex: 1,
    textAlign: "left",
  },
  editButton: {
    padding: "8px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "5px",
  },
  cancelButton: {
    padding: "8px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "5px",
  },
};

export default Catches;
