
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;
const DEMO_USER = "me";

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "20kb" }));

// Interests are stored as a comma-separated string.
const toProfile = (row) => ({
  ...row,
  interests: row.interests.split(",").map((tag) => tag.trim()).filter(Boolean)
});

// Feed and matches change after every swipe, so never serve a cached copy.
app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Get profiles that the demo user has not swiped on.
// Incoming one-sided likes are intentionally not exposed.
app.get("/feed", (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.age,
        p.photo,
        p.bio,
        p.city,
        p.interests
      FROM profiles p
      WHERE NOT EXISTS (
        SELECT 1
        FROM swipes s
        WHERE s.user_id = ?
          AND s.profile_id = p.id
      )
      ORDER BY p.id
    `).all(DEMO_USER);

    res.json({ profiles: rows.map(toProfile) });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Unable to load profiles." });
  }
});

// Save a like or pass and check for a mutual match.
app.post("/swipe", (req, res) => {
  const rawId = req.body?.profileId;
  const profileId = typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : rawId;
  const action = req.body?.action;

  if (
    !Number.isInteger(profileId) ||
    profileId <= 0 ||
    !["like", "pass"].includes(action)
  ) {
    return res.status(400).json({
      error: "Provide a valid profileId and action ('like' or 'pass')."
    });
  }

  try {
    const profile = db
      .prepare("SELECT id, likes_you FROM profiles WHERE id = ?")
      .get(profileId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    let isMatch = false;

    // Use an explicit transaction for node:sqlite.
    db.exec("BEGIN IMMEDIATE");

    try {
      db.prepare(`
        INSERT INTO swipes (user_id, profile_id, action)
        VALUES (?, ?, ?)
      `).run(DEMO_USER, profileId, action);

      isMatch = action === "like" && profile.likes_you === 1;

      if (isMatch) {
        db.prepare(`
          INSERT OR IGNORE INTO matches (user_id, profile_id)
          VALUES (?, ?)
        `).run(DEMO_USER, profileId);
      }

      db.exec("COMMIT");
    } catch (error) {
      // Roll back safely if the transaction is still active.
      try {
        db.exec("ROLLBACK");
      } catch {
        // Ignore rollback errors; report the original error below.
      }

      // Handle duplicate swipes.
      if (
        error.code === "ERR_SQLITE_CONSTRAINT_UNIQUE" ||
        error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
        String(error.message).includes("UNIQUE constraint failed")
      ) {
        return res.status(409).json({
          error: "You have already swiped on this profile."
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      matched: isMatch
    });
  } catch (error) {
    console.error("Swipe error:", error);
    return res.status(500).json({
      error: "Unable to save swipe."
    });
  }
});

// Get mutual matches only.
app.get("/matches", (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.age,
        p.photo,
        p.bio,
        p.city,
        p.interests,
        m.created_at AS matchedAt
      FROM matches m
      JOIN profiles p ON p.id = m.profile_id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
    `).all(DEMO_USER);

    res.json({ matches: rows.map(toProfile) });
  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({ error: "Unable to load matches." });
  }
});

// Handle unexpected errors.
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Coy Discover API running at http://localhost:${PORT}`);
});
