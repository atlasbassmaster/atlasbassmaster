
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Importation du menu
import Login from "./pages/Login";
import Catches from "./pages/Catches";
import Ranking from "./pages/Ranking";
import Admin from "./pages/Admin";
import Results from "./pages/Results";

function App() {
  return (
    <Router>
      <Navbar /> {/* Affichage du menu de navigation */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/catches" element={<Catches />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;

