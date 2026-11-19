
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { photoFor, checkPhotos } from "./photos.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.resolve(here, "../data");

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "coy.sqlite"));

// SQLite configuration
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Create database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    photo TEXT NOT NULL,
    bio TEXT NOT NULL,
    city TEXT NOT NULL,
    interests TEXT NOT NULL,
    likes_you INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    profile_id INTEGER NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL CHECK(action IN ('like','pass')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, profile_id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    profile_id INTEGER NOT NULL REFERENCES profiles(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, profile_id)
  );
`);

// Profile data
const seed = [
  ["Aarav",24,"A curious mind with a soft spot for late-night conversations.","Delhi","Coffee, Photography, Travel",1],
  ["Meera",23,"Collecting little moments, books and stories.","Gurugram","Books, Art, Music",1],
  ["Kabir",25,"Weekend explorer. Always looking for the next good café.","Noida","Food, Hiking, Movies",0],
  ["Ananya",22,"Dreamer by nature, practical by choice.","Delhi","Dance, Fitness, Travel",1],
  ["Rohan",24,"Tech by day, guitar by night.","Faridabad","Music, Coding, Football",0],
  ["Isha",23,"Sunsets, street food and spontaneous plans.","Gurugram","Food, Travel, Photography",0],
  ["Vihaan",26,"Trying to find the best chai in every city.","Delhi","Cricket, Food, Reading",1],
  ["Sana",24,"Art enthusiast who loves meaningful conversations.","Noida","Art, Museums, Coffee",0],
  ["Arjun",23,"A little introverted until the topic is music.","Delhi","Music, Gaming, Movies",1],
  ["Diya",22,"Making playlists for people I haven't met yet.","Gurugram","Music, Books, Cafés",0],
  ["Aditya",25,"Mountains over beaches, always.","Noida","Trekking, Travel, Fitness",0],
  ["Tara",24,"Designing things and finding new places.","Delhi","Design, Shopping, Art",1],
  ["Neil",23,"Big fan of small adventures.","Gurugram","Cycling, Travel, Coffee",0],
  ["Riya",25,"A foodie with a camera roll full of memories.","Faridabad","Food, Photography, Dance",0],
  ["Dev",26,"Calm energy, competitive board-game player.","Delhi","Chess, Startups, Movies",1],
  ["Aisha",23,"Here for good conversations and better desserts.","Noida","Baking, Books, Food",0],
  ["Reyansh",24,"Learning something new every week.","Gurugram","Technology, Running, Music",0],
  ["Myra",22,"Nature walks are my kind of therapy.","Delhi","Nature, Painting, Travel",1],
  ["Kunal",25,"Football, friends and finding hidden gems.","Noida","Football, Food, Gaming",0],
  ["Naina",24,"A storyteller who loves live music.","Delhi","Concerts, Writing, Coffee",0],
  ["Ibrahim",26,"Curious about people, places and ideas.","Gurugram","History, Travel, Cooking",1],
  ["Kiara",23,"Mostly sunshine with a little sarcasm.","Faridabad","Fashion, Dance, Movies",0],
  ["Manav",24,"Gym, work, repeat — with good music.","Delhi","Fitness, Music, Food",0],
  ["Zoya",25,"Bookstore dates are underrated.","Noida","Books, Cats, Art",1],
  ["Dhruv",22,"Learning guitar one chord at a time.","Gurugram","Music, Gaming, Cycling",0],
  ["Aditi",26,"Passionate about making and building things.","Delhi","Startups, Design, Travel",0],
  ["Samar",23,"A beach person living in a city.","Faridabad","Travel, Swimming, Food",1],
  ["Misha",24,"I believe every city has a hidden story.","Noida","Photography, Culture, Books",0],
  ["Yash",25,"Always up for a badminton match.","Delhi","Badminton, Fitness, Movies",0],
  ["Pari",22,"Finding joy in the little things.","Gurugram","Cooking, Music, Nature",1],
  ["Ayaan",26,"Coffee first, everything else later.","Noida","Coffee, Startups, Travel",0],
  ["Sia",23,"Creative soul, curious heart.","Delhi","Painting, Music, Food",0]
];

// Validate photos before changing the database
const photoProblems = checkPhotos(seed.length);

if (photoProblems.length > 0) {
  throw new Error(
    "Photo validation failed:\n" + photoProblems.join("\n")
  );
}

// Prepared statements
const insertProfile = db.prepare(`
  INSERT INTO profiles
  (name, age, photo, bio, city, interests, likes_you)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const updatePhoto = db.prepare(`
  UPDATE profiles SET photo = ? WHERE id = ?
`);

const count = db.prepare(
  "SELECT COUNT(*) AS n FROM profiles"
).get().n;

// Apply photo assignments inside a transaction
db.exec("BEGIN TRANSACTION");

try {
  if (count === 0) {
    // First-time database seeding
    seed.forEach((p, i) => {
      insertProfile.run(
        p[0],
        p[1],
        photoFor(i),
        p[2],
        p[3],
        p[4],
        p[5]
      );
    });

    console.log(`Successfully seeded ${seed.length} profiles.`);
  } else if (count === seed.length) {
    // Update photos for profiles already in the database
    const existingProfiles = db.prepare(
      "SELECT id FROM profiles ORDER BY id"
    ).all();

    existingProfiles.forEach((profile, i) => {
      updatePhoto.run(photoFor(i), profile.id);
    });

    console.log(`Successfully updated photos for ${count} profiles.`);
  } else {
    console.warn(
      `Photo update skipped: expected ${seed.length} profiles, found ${count}.`
    );
  }

  db.exec("COMMIT");
} catch (error) {
  try {
    db.exec("ROLLBACK");
  } catch {}

  throw error;
}

export default db;
