import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <NavLink to="/" style={styles.link}>Accueil</NavLink>
      <NavLink to="/catches" style={styles.link}>Saisie des Prises</NavLink>
      <NavLink to="/ranking" style={styles.link}>Classement</NavLink>
      <NavLink to="/admin" style={styles.link}>Admin</NavLink>
      <NavLink to="/results" style={styles.link}>Résultats</NavLink>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#333",
    padding: "10px",
    display: "flex",
    justifyContent: "space-around",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
  }
};

export default Navbar;