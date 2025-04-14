
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Importation du menu
import Login from "./pages/Login";
import Signin from "./pages/signin";
import Catches from "./pages/Catches";
import Ranking from "./pages/Ranking";
import UserSearchPage from "./pages/UserSearchPage";
import Admin from "./pages/Admin";
import Results from "./pages/Results";
import ProtectedRoute from "./components/ProtectedRoute";
//      <Navbar /> {/* Affichage du menu de navigation */}

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/catches" element={<ProtectedRoute><Catches /></ProtectedRoute>} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/results" element={<Results />} />
        <Route path="/users" element={<UserSearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;


