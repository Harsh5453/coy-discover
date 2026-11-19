import { NavLink, Routes, Route } from "react-router-dom";
import Discover from "./pages/Discover.jsx";
import Matches from "./pages/Matches.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <span className="brand">coy<span>.</span></span>
        <nav className="tabs" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/discover">Discover</NavLink>
          <NavLink to="/matches">Matches</NavLink>
        </nav>
      </header>
      <Routes>
        {/* Home is intentionally blank, as the assignment asks. */}
        <Route path="/" element={<main className="page" aria-label="Home" />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/matches" element={<Matches />} />
      </Routes>
    </div>
  );
}
