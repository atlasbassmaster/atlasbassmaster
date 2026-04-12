import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const UserSearchPage = () => {
  const navigate = useNavigate();

  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ first_name: "", last_name: "", phone: "", toise_id: "" });
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [message, setMessage] = useState("");
  const [catchMessage, setCatchMessage] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [catchUpdates, setCatchUpdates] = useState({});
  const [newCatchLength, setNewCatchLength] = useState("");
  const [rankings, setRankings] = useState([]);
  const [topCatches, setTopCatches] = useState([]);
  const [rankLoading, setRankLoading] = useState(true);
  const [activePanel, setActivePanel] = useState("search"); // "search" | "ranking" | "catches"

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const res = await axios.get("/api/state");
        setFeatureEnabled(res.data.enabled);
      } catch {
        // ignore
      } finally {
        setFeatureLoading(false);
      }
    };
    fetchFeature();
    fetchRankings();
  }, []);

  const toggleFeature = async () => {
    try {
      const res = await axios.put("/api/state/toggle");
      setFeatureEnabled(res.data.enabled);
    } catch (err) {
      console.error("Error toggling feature:", err);
    }
  };

  const fetchRankings = async () => {
    setRankLoading(true);
    try {
      const response = await axios.get("/rankings");
      if (response.data.success) {
        setRankings(response.data.rankings);
        setTopCatches(response.data.topUser || []);
      }
    } catch (err) {
      console.error("Error fetching rankings:", err);
    } finally {
      setRankLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get("/users/search", { params: searchParams });
      if (res.data.success) {
        setResults(res.data.users);
        setMessage(res.data.users.length === 0 ? "Aucun utilisateur trouvé." : "");
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

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
        setCatchMessage("");
        setUpdateMessage("");
        setUpdateSuccess("");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    setUpdateMessage("");
    setUpdateSuccess("");
    try {
      const res = await axios.put(`/users/${selectedUser.id}`, editUser);
      if (res.data.success) {
        setUpdateSuccess("Mis à jour avec succès.");
        await handleSearch();
        await fetchRankings();
      } else {
        setUpdateMessage(res.data.UpdateError);
      }
    } catch (error) {
      setUpdateMessage(error.response?.data?.UpdateError || "Erreur de mise à jour.");
    }
  };

  const handleCatchUpdate = async (catchId, newLength) => {
    try {
      const res = await axios.put(`/catches/${catchId}`, { length: newLength });
      if (res.data.success) {
        setCatchMessage("Prise mise à jour.");
        await handleSelectUser(selectedUser.id);
        await fetchRankings();
      } else {
        setCatchMessage(res.data.message);
      }
    } catch (error) {
      setCatchMessage(error.response?.data?.message || "Erreur.");
    }
  };

  const handleCatchDelete = async (catchId) => {
    try {
      const res = await axios.delete(`/catches/${catchId}`, { data: { userId: selectedUser.id, catchId } });
      if (res.data.success) {
        setCatchMessage("Prise supprimée.");
        await handleSelectUser(selectedUser.id);
        await fetchRankings();
      }
    } catch {
      setCatchMessage("Erreur lors de la suppression.");
    }
  };

  const handleAddCatch = async (e) => {
    e.preventDefault();
    const lengthVal = parseFloat(newCatchLength);
    if (isNaN(lengthVal) || lengthVal % 0.5 !== 0 || lengthVal < 30 || lengthVal > 70) {
      setCatchMessage("Longueur invalide (30–70 cm, multiple de 0.5).");
      return;
    }
    try {
      const res = await axios.post("/catches", { length: lengthVal, user_id: selectedUser.id });
      if (res.data.success) {
        setCatchMessage("Prise ajoutée.");
        setNewCatchLength("");
        await handleSelectUser(selectedUser.id);
        await fetchRankings();
      }
    } catch (error) {
      setCatchMessage(error.response?.data?.error || "Erreur lors de l'ajout.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("staff__id");
    navigate("/");
  };

  const handleExport = (type) => {
    window.open(`${BASE_URL}/rankings/export/${type}`, "_blank");
  };

  const tabs = [
    { id: "search", label: "🔍 Recherche" },
    { id: "ranking", label: "🏆 Classement" },
    { id: "catches", label: "🎣 Prises" },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <img src="/logo.png" alt="Logo" style={s.headerLogo} />
          <span style={s.headerTitle}>Admin</span>
        </div>
        <div style={s.headerRight}>
          <button
            onClick={toggleFeature}
            disabled={featureLoading}
            style={{ ...s.toggleBtn, background: featureEnabled ? "#e53935" : "#43a047" }}
          >
            {featureLoading ? "…" : featureEnabled ? "⏹ Désactiver" : "▶ Activer"}
          </button>
          <button onClick={handleLogout} style={s.logoutBtn}>Déconnexion</button>
        </div>
      </div>

      {/* Export buttons */}
      <div style={s.exportBar}>
        <span style={s.exportLabel}>Exporter :</span>
        <button onClick={() => handleExport("classement")} style={s.exportBtn}>📊 Classement</button>
        <button onClick={() => handleExport("catches")} style={s.exportBtn}>🐟 Prises</button>
        <button onClick={() => handleExport("toises")} style={s.exportBtn}>🏷 Toises</button>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActivePanel(tab.id)}
            style={{ ...s.tab, ...(activePanel === tab.id ? s.tabActive : {}) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={s.content}>

        {/* ── SEARCH PANEL ── */}
        {activePanel === "search" && (
          <div>
            <div style={s.searchGrid}>
              <input name="first_name" placeholder="Prénom" value={searchParams.first_name}
                onChange={handleSearchChange} style={s.input} />
              <input name="last_name" placeholder="Nom" value={searchParams.last_name}
                onChange={handleSearchChange} style={s.input} />
              <input name="phone" placeholder="Téléphone" inputMode="numeric"
                value={searchParams.phone} onChange={handleSearchChange} style={s.input} />
              <input name="toise_id" placeholder="Toise" inputMode="numeric"
                value={searchParams.toise_id} onChange={handleSearchChange} style={s.input} />
            </div>
            <button onClick={handleSearch} style={s.searchBtn}>Rechercher</button>

            {message && <p style={s.error}>{message}</p>}

            {results.length > 0 && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Prénom", "Nom", "Téléphone", "Toise"].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((user) => (
                      <tr key={user.id} onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectUser(user.id)}
                        style={{ ...s.tr, background: selectedUser?.id === user.id ? "#e3f2fd" : "#fff" }}>
                        <td style={s.td}>{user.first_name}</td>
                        <td style={s.td}>{user.last_name}</td>
                        <td style={s.td}>{user.phone_number}</td>
                        <td style={s.td}>{user.toise_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedUser && (
              <div style={s.userCard}>
                <h3 style={s.cardTitle}>{selectedUser.first_name} {selectedUser.last_name}</h3>

                <form onSubmit={handleUserUpdate} style={s.formGrid}>
                  <input placeholder="Prénom" value={editUser.first_name}
                    onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })} style={s.input} />
                  <input placeholder="Nom" value={editUser.last_name}
                    onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })} style={s.input} />
                  <input placeholder="Téléphone" value={editUser.phone_number}
                    onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })} style={s.input} />
                  <input placeholder="Toise" value={editUser.toise_id}
                    onChange={(e) => setEditUser({ ...editUser, toise_id: e.target.value })} style={s.input} />
                  <button type="submit" style={{ ...s.actionBtn, gridColumn: "1/-1" }}>Mettre à jour</button>
                </form>
                {updateMessage && <p style={s.error}>{updateMessage}</p>}
                {updateSuccess && <p style={s.success}>{updateSuccess}</p>}

                <h4 style={s.subTitle}>Ajouter une prise</h4>
                <form onSubmit={handleAddCatch} style={s.inlineForm}>
                  <input type="number" placeholder="Longueur (cm)" value={newCatchLength} step="0.5"
                    onChange={(e) => setNewCatchLength(e.target.value)} style={{ ...s.input, flex: 1 }} required />
                  <button type="submit" style={s.actionBtn}>Ajouter</button>
                </form>
                {catchMessage && <p style={s.error}>{catchMessage}</p>}

                <h4 style={s.subTitle}>Prises ({selectedUser.Catches?.length || 0})</h4>
                {selectedUser.Catches?.length > 0 ? (
                  <div style={s.catchList}>
                    {selectedUser.Catches.map((c) => (
                      <div key={c.id} style={s.catchRow}>
                        <div style={s.catchInfo}>
                          <span style={s.catchLen}>{c.length} cm</span>
                          <span style={s.catchDate}>
                            {new Date(c.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                        <div style={s.catchActions}>
                          <select defaultValue={c.length}
                            onChange={(e) => setCatchUpdates((p) => ({ ...p, [c.id]: parseFloat(e.target.value) }))}
                            style={s.select}>
                            {Array.from({ length: ((70 - 30) / 0.5) + 1 }, (_, i) => {
                              const v = (30 + i * 0.5).toFixed(1);
                              return <option key={v} value={v}>{v}</option>;
                            })}
                          </select>
                          <button onClick={() => handleCatchUpdate(c.id, catchUpdates[c.id] ?? c.length)} style={s.saveBtn}>✓</button>
                          <button onClick={() => handleCatchDelete(c.id)} style={s.delBtn}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: "#aaa" }}>Aucune prise.</p>}
              </div>
            )}
          </div>
        )}

        {/* ── RANKING PANEL ── */}
        {activePanel === "ranking" && (
          <div>
            <h3 style={s.panelTitle}>Classement général</h3>
            {rankLoading ? <p>Chargement…</p> : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["#", "Prénom", "Nom", "Toise", "Points"].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((user, i) => (
                      <tr key={user.user_id} style={{ ...s.tr, background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={{ ...s.td, fontWeight: "bold", color: i < 3 ? "#f0c040" : "#333" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </td>
                        <td style={s.td}>{user.first_name}</td>
                        <td style={s.td}>{user.last_name}</td>
                        <td style={s.td}>{user.toise_id}</td>
                        <td style={{ ...s.td, fontWeight: "bold" }}>{user.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CATCHES PANEL ── */}
        {activePanel === "catches" && (
          <div>
            <h3 style={s.panelTitle}>Plus grandes prises</h3>
            {rankLoading ? <p>Chargement…</p> : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["#", "Prénom", "Nom", "Longueur", "Toise", "Date"].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topCatches.map((user, i) => (
                      <tr key={`${user.user_id}-${i}`} style={{ ...s.tr, background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={{ ...s.td, fontWeight: "bold" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </td>
                        <td style={s.td}>{user.first_name}</td>
                        <td style={s.td}>{user.last_name}</td>
                        <td style={{ ...s.td, fontWeight: "bold" }}>{user.length} cm</td>
                        <td style={s.td}>{user.toise_id}</td>
                        <td style={s.td}>
                          {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                            .format(new Date(user.created_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#f0f4f8",
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom: "40px",
  },
  header: {
    background: "#1a1a2e",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerLogo: { width: "32px", height: "32px", borderRadius: "50%" },
  headerTitle: { color: "#fff", fontWeight: "bold", fontSize: "18px" },
  headerRight: { display: "flex", gap: "8px", alignItems: "center" },
  toggleBtn: {
    color: "#fff", border: "none", borderRadius: "20px",
    padding: "6px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "bold",
  },
  logoutBtn: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
  },
  exportBar: {
    background: "#fff", padding: "10px 16px", display: "flex",
    alignItems: "center", gap: "8px", flexWrap: "wrap",
    borderBottom: "1px solid #e0e0e0",
  },
  exportLabel: { fontSize: "13px", color: "#666", marginRight: "4px" },
  exportBtn: {
    background: "#1a1a2e", color: "#fff", border: "none",
    borderRadius: "6px", padding: "7px 14px", cursor: "pointer", fontSize: "13px",
  },
  tabBar: {
    display: "flex", background: "#fff",
    borderBottom: "2px solid #e0e0e0",
  },
  tab: {
    flex: 1, padding: "12px 8px", border: "none", background: "transparent",
    color: "#888", cursor: "pointer", fontSize: "14px",
    borderBottom: "2px solid transparent", marginBottom: "-2px",
  },
  tabActive: {
    color: "#1a1a2e", fontWeight: "bold",
    borderBottom: "2px solid #1a1a2e",
  },
  content: { padding: "16px", maxWidth: "800px", margin: "0 auto" },
  panelTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "12px", color: "#1a1a2e" },
  searchGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "8px", marginBottom: "10px",
  },
  input: {
    padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px",
    fontSize: "15px", width: "100%", boxSizing: "border-box",
  },
  searchBtn: {
    width: "100%", padding: "11px", background: "#1a1a2e",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginBottom: "16px",
  },
  tableWrap: {
    overflowY: "auto", maxHeight: "60vh",
    borderRadius: "10px", border: "1px solid #e0e0e0",
    marginBottom: "16px",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: {
    background: "#1a1a2e", color: "#fff", padding: "10px 8px",
    textAlign: "left", position: "sticky", top: 0,
  },
  tr: { cursor: "pointer", borderBottom: "1px solid #f0f0f0" },
  td: { padding: "10px 8px", color: "#333" },
  userCard: {
    background: "#fff", borderRadius: "12px", padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginTop: "16px",
  },
  cardTitle: { fontSize: "17px", fontWeight: "bold", marginBottom: "12px", color: "#1a1a2e" },
  subTitle: { fontSize: "15px", fontWeight: "bold", margin: "16px 0 8px", color: "#444" },
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "8px", marginBottom: "8px",
  },
  inlineForm: { display: "flex", gap: "8px", marginBottom: "8px" },
  actionBtn: {
    padding: "10px 16px", background: "#1a1a2e", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold",
  },
  catchList: { display: "flex", flexDirection: "column", gap: "8px" },
  catchRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px", flexWrap: "wrap", gap: "8px",
  },
  catchInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  catchLen: { fontWeight: "bold", fontSize: "16px", color: "#1a1a2e" },
  catchDate: { fontSize: "12px", color: "#999" },
  catchActions: { display: "flex", alignItems: "center", gap: "6px" },
  select: { padding: "6px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" },
  saveBtn: {
    background: "#e8f5e9", color: "#388e3c", border: "none",
    borderRadius: "6px", padding: "6px 10px", cursor: "pointer",
  },
  delBtn: {
    background: "#ffebee", color: "#e53935", border: "none",
    borderRadius: "6px", padding: "6px 10px", cursor: "pointer",
  },
  error: { color: "#e53935", fontSize: "13px", marginTop: "4px" },
  success: { color: "#388e3c", fontSize: "13px", marginTop: "4px" },
};

export default UserSearchPage;
