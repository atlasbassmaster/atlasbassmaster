import React, { useState, useEffect } from "react";
import axios from "../services/api";

const UserSearchPage = () => {
  // States for search
  const [searchParams, setSearchParams] = useState({
    first_name: "",
    last_name: "",
    phone: "",
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
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Error updating user.");
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
            placeholder="Téléphone"
            value={searchParams.phone}
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
              {user.first_name} {user.last_name} - {user.phone_number}
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
              <button type="submit" style={styles.button}>
                Update User
              </button>
            </form>

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
            {message && <p style={styles.errorMessage}>{message}</p>}
          </div>
        )}
      </div>

      {/* Ranking section */}
      <div style={styles.rankingSection}>
        <h2>User Rankings</h2>
        {rankLoading && <p>Loading rankings...</p>}
        {rankError && <p>{rankError}</p>}
        {topUser && (
          <div style={styles.topUserSection}>
            <h2>🏆 Biggest Catch</h2>
            <p>
              <strong>
                {topUser.first_name} {topUser.last_name}
              </strong>{" "}
              caught a fish measuring <strong>{topUser.length} cm</strong> on{" "}
              {new Date(topUser.created_at).toLocaleDateString()}.
            </p>
          </div>
        )}
        {rankings.length > 0 ? (
          <div style={styles.rankingsSection}>
            <h2>🎯 Top 5 Users</h2>
            <ol>
              {rankings.slice(0, 5).map((user, index) => (
                <li key={user.user_id} style={styles.rankingItem}>
                  <span>
                    {index + 1}. {user.first_name} {user.last_name}
                  </span>
                  <span>{user.points} pts</span>
                </li>
              ))}
            </ol>
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
  }
};

export default UserSearchPage;
