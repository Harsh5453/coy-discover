import { useState } from "react";

// Profile photo with a plain placeholder if the image fails to load.
export default function Photo({ profile, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`photo photo-fallback ${className}`} role="img" aria-label={`${profile.name}, photo unavailable`}>
        {profile.name[0]}
      </div>
    );
  }

  return (
    <img
      className={`photo ${className}`}
      src={profile.photo}
      alt={`Photo of ${profile.name}`}
      draggable="false"
      onError={() => setFailed(true)}
    />
  );
}
