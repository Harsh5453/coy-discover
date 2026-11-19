
export const malePhotos = [
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1758598497190-f609ecba227b?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1705645930353-0e335311ef20?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1580518337843-f959e992563b?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1656338997878-279d71d48f6e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1543965170-4c01a586684e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=500&auto=format&fit=crop&q=60"
];

export const femalePhotos = [
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1560087637-bf797bc7796a?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1690444963408-9573a17a8058?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1602442787305-decbd65be507?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1481214110143-ed630356e1bb?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1636308600707-e19abecd6246?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1627161683077-e34782c24d81?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1598554793905-075f7b355cd9?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1598630388567-9fdbfd7e928e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1604436607823-d721dfe2df46?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1658973123042-44f6733ee322?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1534945773093-1119ae5684ab?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?w=500&auto=format&fit=crop&q=60"
];

// Assign photos according to alternating profile order:
// Aarav = malePhotos[0], Meera = femalePhotos[0],
// Kabir = malePhotos[1], Ananya = femalePhotos[1], etc.
export function photoFor(index) {
  if (!Number.isInteger(index) || index < 0 || index >= 32) {
    throw new Error(`Invalid profile index: ${index}`);
  }

  const photoIndex = Math.floor(index / 2);

  const photo = index % 2 === 0
    ? malePhotos[photoIndex]
    : femalePhotos[photoIndex];

  if (!photo) {
    throw new Error(
      `Missing profile photo for profile index ${index}.`
    );
  }

  return photo;
}

// Validate photo collection before database seeding
export function checkPhotos(expectedCount) {
  const problems = [];
  const allPhotos = [...malePhotos, ...femalePhotos];

  if (malePhotos.length !== 16) {
    problems.push(
      `Expected 16 male photos, found ${malePhotos.length}.`
    );
  }

  if (femalePhotos.length !== 16) {
    problems.push(
      `Expected 16 female photos, found ${femalePhotos.length}.`
    );
  }

  if (allPhotos.length !== expectedCount) {
    problems.push(
      `Expected ${expectedCount} total photos, found ${allPhotos.length}.`
    );
  }

  if (new Set(allPhotos).size !== allPhotos.length) {
    problems.push("Duplicate photo URLs detected.");
  }

  return problems;
}
