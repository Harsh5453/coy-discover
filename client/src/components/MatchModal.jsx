import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Photo from "./Photo.jsx";

export default function MatchModal({ profile, onClose }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!profile) return;
    buttonRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profile, onClose]);

  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          className="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Photo profile={profile} className="modal-photo" />
            <h2 id="match-title">It's a match!</h2>
            <p>You and {profile.name} liked each other.</p>
            <button ref={buttonRef} className="btn btn-primary" onClick={onClose}>
              Keep discovering
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
