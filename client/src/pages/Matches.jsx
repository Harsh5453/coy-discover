import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import Photo from "../components/Photo.jsx";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/matches");
      setMatches(data.matches);
    } catch {
      setError("Couldn't load your matches. Check that the server is running and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  let body;
  if (loading) {
    body = <p className="status" role="status">Loading matches…</p>;
  } else if (error) {
    body = (
      <div className="empty" role="alert">
        <p>{error}</p>
        <button className="btn" onClick={load}>Try again</button>
      </div>
    );
  } else if (matches.length === 0) {
    body = (
      <div className="empty">
        <h2>No matches yet</h2>
        <p>When you and someone else like each other, they'll show up here.</p>
      </div>
    );
  } else {
    body = (
      <ul className="match-grid">
        {matches.map((m) => (
          <li key={m.id} className="match">
            <Photo profile={m} />
            <h3>{m.name}, {m.age}</h3>
            <p>{m.city}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="page">
      <h1>Matches</h1>
      {body}
    </main>
  );
}
