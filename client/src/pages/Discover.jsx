import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { api } from "../api";
import ProfileCard from "../components/ProfileCard.jsx";
import MatchModal from "../components/MatchModal.jsx";

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [matched, setMatched] = useState(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/feed");
      setProfiles(data.profiles);
      setIndex(0);
    } catch {
      setLoadError("Couldn't load profiles. Check that the server is running and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const current = profiles[index];

  // Warm the cache so the next card doesn't pop in without its photo.
  useEffect(() => {
    const next = profiles[index + 1];
    if (next) new Image().src = next.photo;
  }, [profiles, index]);

  // The card leaves right away; the request runs in the background and is
  // rolled back if it fails. inFlight blocks a second swipe in the meantime.
  const swipe = useCallback(
    async (action) => {
      if (!current || inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setNotice("");
      setDir(action === "like" ? 1 : -1);
      setIndex((i) => i + 1);
      try {
        const { data } = await api.post("/swipe", { profileId: current.id, action });
        if (data.matched) setMatched(current);
      } catch (err) {
        // 409 means this profile was already swiped (for example in another tab),
        // so it should stay gone. Any other failure puts the card back.
        if (err.response?.status !== 409) {
          setIndex((i) => i - 1);
          setNotice(err.response?.data?.error || "Couldn't save that swipe. Please try again.");
        }
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [current]
  );

  // Left and right arrow keys work like the buttons.
  useEffect(() => {
    if (matched) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") swipe("like");
      if (e.key === "ArrowLeft") swipe("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, matched]);

  if (loading) {
    return (
      <main className="page page-narrow">
        <p className="status" role="status">Loading profiles…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page page-narrow">
        <div className="empty" role="alert">
          <h2>Something went wrong</h2>
          <p>{loadError}</p>
          <button className="btn" onClick={loadFeed}>Try again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-narrow">
      <div className="stage">
        {/* The stage stays mounted so the last card can finish leaving before the empty state shows. */}
        <AnimatePresence custom={dir} initial={false}>
          {current && <ProfileCard key={current.id} profile={current} onSwipe={swipe} disabled={busy} />}
        </AnimatePresence>
        {!current && (
          <div className="empty">
            <h2>You've seen everyone</h2>
            <p>There are no more profiles right now. Check back later.</p>
            <button className="btn" onClick={loadFeed}>Check again</button>
          </div>
        )}
      </div>
      {current && (
        <>
          <p className="notice" role="alert">{notice}</p>
          <div className="actions">
            <button className="btn" onClick={() => swipe("pass")} disabled={busy}>
              <X size={18} aria-hidden="true" /> Pass
            </button>
            <button className="btn btn-primary" onClick={() => swipe("like")} disabled={busy}>
              <Heart size={18} aria-hidden="true" /> Like
            </button>
          </div>
          <p className="hint">Drag the card left or right, or use the arrow keys.</p>
        </>
      )}
      <MatchModal profile={matched} onClose={() => setMatched(null)} />
    </main>
  );
}
