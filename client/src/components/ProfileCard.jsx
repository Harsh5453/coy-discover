import { motion, useMotionValue, useTransform } from "framer-motion";
import Photo from "./Photo.jsx";

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

// The exit direction comes from AnimatePresence's `custom` value (1 = right, -1 = left).
const variants = {
  enter: { opacity: 0, scale: 0.97 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: (dir) => ({ x: dir * 480, rotate: dir * 8, opacity: 0, transition: { duration: 0.22 } })
};

export default function ProfileCard({ profile, onSwipe, disabled }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-8, 8]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);

  function handleDragEnd(_, { offset, velocity }) {
    if (disabled) return;
    if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onSwipe("like");
    else if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onSwipe("pass");
  }

  return (
    <motion.article
      className="card"
      style={{ x, rotate }}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      <div className="card-photo">
        <Photo profile={profile} />
        <motion.span className="stamp stamp-like" style={{ opacity: likeOpacity }} aria-hidden="true">Like</motion.span>
        <motion.span className="stamp stamp-pass" style={{ opacity: passOpacity }} aria-hidden="true">Pass</motion.span>
      </div>
      <div className="card-info">
        <h2>{profile.name}, {profile.age}</h2>
        <p className="card-city">{profile.city}</p>
        <p className="card-bio">{profile.bio}</p>
        <p className="card-interests">{profile.interests.join(" · ")}</p>
      </div>
    </motion.article>
  );
}
