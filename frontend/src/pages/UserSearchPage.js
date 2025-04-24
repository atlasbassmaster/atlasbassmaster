import React, { useState, useEffect } from "react";
import axios from "../services/api";

const UserSearchPage = () => {

 const [featureEnabled, setFeatureEnabled] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(true);

  // Fetch feature toggle on mount
  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const res = await axios.get("/api/state");
        setFeatureEnabled(res.data.enabled);
      } catch (err) {
        console.error("Error fetching feature state:", err);
      } finally {
        setFeatureLoading(false);
      }
    };
    fetchFeature();
  }, []);

  // Toggle the feature on the server
  const toggleFeature = async () => {
    try {
      const res = await axios.put("/api/state/toggle");
      setFeatureEnabled(res.data.enabled);
    } catch (err) {
      console.error("Error toggling feature:", err);
    }
  };


  // States for search
  const [searchParams, setSearchParams] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    toise_id: "",
  });
  const [results, setResults] = useState([]);

  const validateNumbers = (value) => /^[0-9]*$/.test(value);
  const validateLength = (value) => {
    // Check if the value is a multiple of 0.5
    return value % 0.5 === 0;
  };

  // State for selected user and editing
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [message, setMessage] = useState("");
  const [UpdateMessage, setUpdateMessage] = useState("");

  // State to track new catch lengths (by catch id) for editing catches
  const [catchUpdates, setCatchUpdates] = useState({});

  // State for adding a new catch
  const [newCatchLength, setNewCatchLength] = useState("");

  // State for user rankings (for vertical div on right)
  const [rankings, setRankings] = useState([]);
  const [topUser, setTopUser] = useState(null);
  const [rankLoading, setRankLoading] = useState(true);
  const [rankError, setRankError] = useState("");

  // Fetch rankings
  const fetchRankings = async () => {
    try {
      const response = await axios.get("/rankings");
      if (response.data.success) {
        setRankings(response.data.rankings);
        setTopUser(response.data.topUser);
      } else {
        setRankError("Failed to fetch rankings.");
      }
    } catch (err) {
      console.error("Error fetching rankings:", err);
      setRankError("An error occurred while fetching rankings.");
    } finally {
      setRankLoading(false);
    }
  };

  // Fetch rankings on mount
  useEffect(() => {
    fetchRankings();
  }, []);

  // Handle search field changes
  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Search users by making an API GET request with query parameters
  const handleSearch = async () => {
    try {
      const res = await axios.get("/users/search", { params: searchParams });
      if (res.data.success) {
        setResults(res.data.users);
        if (!res.data.users || res.data.users.length === 0) {
          setMessage("No users found.");
        } else {
          setMessage("");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // When a user is clicked, load full user details (including catches)
  const handleSelectUser = async (id) => {
    try {
      const res = await axios.get(`/users/${id}`);
      if (res.data.success) {
        setSelectedUser(res.data.user);
        setEditUser({
          first_name: res.data.user.first_name,
          last_name: res.data.user.last_name,
          phone_number: res.data.user.phone_number,
          toise_id: res.data.user.toise_id,
        });
        setCatchUpdates({});
        setMessage("");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Update user information via PUT and refresh data
  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/users/${selectedUser.id}`, editUser);
      if (res.data.success) {
        setMessage("User updated successfully.");
        await handleSearch();
        await fetchRankings();
      }
      else {
        setUpdateMessage(res.data.UpdateError);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if(error.response.data.UpdateError) {
        setUpdateMessage(error.response.data.UpdateError);
      }
      else {
        setUpdateMessage("Error updating user");
      }
    }
  };

  // Update a catch's length via PUT and refresh data
  const handleCatchUpdate = async (catchId, newLength) => {
    try {
      const res = await axios.put(`/catches/${catchId}`, { length: newLength });
      if (res.data.success) {
        setMessage("Catch updated.");
        await handleSelectUser(selectedUser.id);
        await fetchRankings();
      }
      else {
      setMessage(res.data.message);
      }
    } catch (error) {

      console.error("Error updating catch:", error);
      setMessage(error.response.data.message);
    }
  };



  // Delete a catch via DELETE and refresh data
  const handleCatchDelete = async (catchId) => {
    try {
      const res = await axios.delete(`/catches/${catchId}`, {
        data: { userId: selectedUser.id, catchId },
      });
      if (res.data.success) {
        setMessage("Catch deleted successfully.");
        await handleSelectUser(selectedUser.id);
        await fetchRankings();
      }
    } catch (error) {
      console.error("Error deleting catch:", error);
      setMessage("Error deleting catch.");
    }
  };

  // Add a new catch for the selected user and refresh data
  const handleAddCatch = async (e) => {
    e.preventDefault();
    const lengthVal = parseFloat(newCatchLength);
    if (!validateLength(lengthVal)) {
      setMessage("Catch length must be a multiple of 0.5.");
      return;
    }
    try {
      const res = await axios.post("/catches", {
        length: lengthVal,
        user_id: selectedUser.id,
      });
      if (res.data.success) {
        setMessage("Catch added successfully.");
        setNewCatchLength("");
        await handleSelectUser(selectedUser.id);
        await fetchRankings();
      }
    } catch (error) {
      console.error("Error adding catch:", error);
      setMessage("Error adding catch.");
    }
  };

  return (
    <div style={styles.pageContainer}>

          <div style={styles.featureToggle}>
            <button
              onClick={toggleFeature}
              disabled={featureLoading}
              style={{
                ...styles.button,
                background: featureEnabled ? "#dc3545" : "#28a745",
              }}
            >
              { featureLoading
                  ? "Loading…"
                  : featureEnabled
                    ? "Désactiver les saisies"
                    : "Activer les saisies" }
            </button>
          </div>

      {/* Main content */}
      <div style={styles.mainSection}>
        <h1>User Search</h1>
        <div style={styles.searchFields}>
          <input
            name="first_name"
            placeholder="Prenom"
            value={searchParams.first_name}
            onChange={handleSearchChange}
            style={styles.input}
          />
          <input
            name="last_name"
            placeholder="Nom"
            value={searchParams.last_name}
            onChange={handleSearchChange}
            style={styles.input}
          />
          <input
            name="phone"
            type="number"
            placeholder="Téléphone"
            value={searchParams.phone}
            onChange={handleSearchChange}
            style={styles.input}
          />
          <input
              name="toise_id"
              type="number"
              placeholder="Toise"
              value={searchParams.toise_id}
              onChange={handleSearchChange}
              style={styles.input}
          />

          <button onClick={handleSearch} style={styles.button}>
            Search
          </button>
        </div>

        <h2>Results</h2>
        {message && <p style={styles.errorMessage}>{message}</p>}
        <ul style={styles.resultList}>
          {results.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              style={styles.resultItem}
            >
              {user.first_name} {user.last_name} - {user.phone_number} - {user.toise_id}
            </li>
          ))}
        </ul>

        {selectedUser && (
          <div style={styles.userDetails}>
            <h2>User Details</h2>
            <form onSubmit={handleUserUpdate}>
              <input
                name="first_name"
                placeholder="Prenom"
                value={editUser.first_name}
                onChange={(e) =>
                  setEditUser({ ...editUser, first_name: e.target.value })
                }
                style={styles.input}
              />
              <input
                name="last_name"
                placeholder="Nom"
                value={editUser.last_name}
                onChange={(e) =>
                  setEditUser({ ...editUser, last_name: e.target.value })
                }
                style={styles.input}
              />
              <input
                name="phone_number"
                placeholder="Téléphone"
                value={editUser.phone_number}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone_number: e.target.value })
                }
                style={styles.input}
              />
              <input
                  name="toise_id"
                  placeholder="Toise"
                  value={editUser.toise_id}
                  onChange={(e) =>
                      setEditUser({ ...editUser, toise_id: e.target.value })
                  }
                  style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Update User
              </button>
            </form>
            {UpdateMessage && <p style={styles.errorMessage}>{UpdateMessage}</p>}

            {/* New Catch Form */}
            <h2>Add a New Catch</h2>
            <form onSubmit={handleAddCatch}>
              <input
                type="number"
                placeholder="Catch length (cm)"
                value={newCatchLength}
                onChange={(e) => setNewCatchLength(e.target.value)}
                step="0.5"
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>
                Add Catch
              </button>
            </form>
            {message && <p style={styles.errorMessage}>{message}</p>}

            <h2>User Catches</h2>
            {selectedUser.Catches && selectedUser.Catches.length > 0 ? (
              <ul style={styles.catchList}>
                {selectedUser.Catches.map((c) => (
                  <li key={c.id} style={styles.catchItem}>
                    <div>
                      <strong>Catch:</strong> {c.length} cm{" "}
                      <span style={styles.catchTime}>
                        (
                        {new Date(c.created_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                        )
                      </span>
                    </div>
                    <div style={styles.catchActions}>
                      <input
                        type="number"
                        defaultValue={c.length}
                        step="0.5"
                        onChange={(e) => {
                          const newVal = parseFloat(e.target.value);
                          setCatchUpdates((prev) => ({
                            ...prev,
                            [c.id]: newVal,
                          }));
                        }}
                        style={styles.catchInput}
                      />
                      <button
                        onClick={() =>
                          handleCatchUpdate(
                            c.id,
                            catchUpdates[c.id] !== undefined
                              ? catchUpdates[c.id]
                              : c.length
                          )
                        }
                        style={styles.button}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleCatchDelete(c.id)}
                        style={{ ...styles.button, background: "red" }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No catches available.</p>
            )}
          </div>
        )}
      </div>

      {/* Ranking section */}
      <div style={styles.rankingSection}>
        <h2>User Rankings</h2>
        {rankLoading && <p>Loading rankings...</p>}
        {rankError && <p>{rankError}</p>}
        {topUser && (
          <div style={styles.tableWrapper}>
            <table style={styles.catchTable}>
              <thead>
                <tr>
                  <th style={styles.headerCell}>Rank</th>
                  <th style={styles.headerCell}>Name</th>
                  <th style={styles.headerCell}>Length (cm)</th>
                  <th style={styles.headerCell}>Date</th>
                  <th style={styles.headerCell}>Toise</th>
                </tr>
              </thead>
              <tbody>
                {topUser.slice(0, 3).map((user, index) => {
                  // Format date as "HH:mm dd/MM/yyyy"
                  const formattedDate = new Intl.DateTimeFormat('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).format(new Date(user.created_at));            // locale‑aware formatting :contentReference[oaicite:9]{index=9}

                  const isOdd = index % 2 === 1;
                  return (
                    <tr
                      key={user.user_id}
                      style={isOdd ? { ...styles.row, ...styles.rowOdd } : styles.row} // alternating rows
                    >
                      <td style={styles.cell}>{index + 1}</td>
                      <td style={styles.cell}>
                        {user.first_name} {user.last_name}
                      </td>
                      <td style={styles.cell}>{user.length}</td>
                      <td style={styles.cell}>{formattedDate}</td>
                      <td style={styles.cell}>{user.toise_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        )}
        {rankings.length > 0 ? (
          <div style={styles.rankingsSection}>
            <h2>🎯 Top 5 Users</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.catchTable}>
                <thead>
                  <tr>
                    <th style={styles.headerCell}>Rank</th>
                    <th style={styles.headerCell}>Name</th>
                    <th style={styles.headerCell}>Length (cm)</th>
                    <th style={styles.headerCell}>Toise</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.slice(0, 5).map((user, index) => {


                    const isOdd = index % 2 === 1;
                    return (
                      <tr
                        key={user.user_id}
                        style={isOdd ? { ...styles.row, ...styles.rowOdd } : styles.row}
                      >
                        <td style={styles.cell}>{index + 1}</td>
                        <td style={styles.cell}>
                          {user.first_name} {user.last_name}
                        </td>
                        <td style={styles.cell}>{user.points} pts</td>
                        <td style={styles.cell}>{user.toise_id}</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          <p>No rankings available.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  // Mobile-friendly layout: stack sections vertically.
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    fontFamily: "Arial, sans-serif",
  },
  mainSection: {
    flex: 1,
    width: "100%",
    marginBottom: "20px",
  },
  rankingSection: {
    width: "100%",
    padding: "10px",
    borderTop: "1px solid #ccc",
    marginTop: "20px",
  },
  searchFields: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px 16px",
    background: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  resultList: {
    listStyle: "none",
    padding: 0,
  },
  resultItem: {
    padding: "10px",
    borderBottom: "1px solid #ccc",
    cursor: "pointer",
    textAlign: "left",
  },
  userDetails: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  catchList: {
    listStyle: "none",
    padding: 0,
  },
  catchItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "5px 0",
    borderBottom: "1px solid #eee",
  },
  catchTime: {
    fontSize: "0.9em",
    color: "#555",
  },
  catchActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-start",
  },
  catchInput: {
    width: "100%",
    padding: "4px",
    fontSize: "16px",
    marginBottom: "5px",
  },
  rankingItem: {
    textAlign: "left",
    padding: "10px 0",
    borderBottom: "1px solid #ccc",
  },
  topUserSection: {
    marginBottom: "20px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  rankingsSection: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f1f1f1",
  },
  errorMessage: {
  color: "red"
  },
   tableWrapper: {
      overflowX: 'auto',                   // horizontal scroll on small screens :contentReference[oaicite:5]{index=5}
      margin: '1rem 0',
    },
    catchTable: {
      width: '100%',
      borderCollapse: 'collapse',          // hide borders :contentReference[oaicite:6]{index=6}
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', // lake‑blue gradient :contentReference[oaicite:7]{index=7}
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: "'Segoe UI', sans-serif",
      textAlign: 'center',                 // center text in all cells
    },
    headerCell: {
      backgroundColor: 'grey',          // wood‑brown accent :contentReference[oaicite:8]{index=8}
      color: '#ffffff',
      padding: '0.75rem',
      fontSize: '1rem',
    },
    row: {
      borderBottom: '1px solid rgba(255,255,255,0.3)',
    },
    rowOdd: {
      backgroundColor: 'rgba(255,255,255,0.3)', // subtle shading for odd rows
    },
    cell: {
      padding: '0.75rem',
      color: '#004d40',                    // dark teal text for contrast
    },
};

export default UserSearchPage;
