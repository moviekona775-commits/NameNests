
// NameNests - Baby Name Generator
// Version 1.0

const searchInput = document.getElementById("searchInput");
const genderFilter = document.getElementById("genderFilter");
const originFilter = document.getElementById("originFilter");
const nameGrid = document.getElementById("nameGrid");

let names = [];
let favorites = JSON.parse(
  localStorage.getItem("namenestsFavorites") || "[]"
);

async function loadNames() {
  try {
    const response = await fetch("names.json");

    if (!response.ok) {
      throw new Error("Database could not be loaded");
    }

    names = await response.json();
    loadOrigins();
    displayNames();
  } catch (error) {
    nameGrid.innerHTML =
      "<p>Names are loading soon. Please try again later.</p>";
    console.error(error);
  }
}

function loadOrigins() {
  const origins = [...new Set(names.map(name => name.origin))]
    .filter(Boolean)
    .sort();

  origins.forEach(origin => {
    const option = document.createElement("option");
    option.value = origin;
    option.textContent = origin;
    originFilter.appendChild(option);
  });
}

function displayNames() {
  const search = searchInput.value.toLowerCase().trim();
  const gender = genderFilter.value;
  const origin = originFilter.value;

  const filtered = names.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.meaning.toLowerCase().includes(search);

    const matchesGender =
      gender === "All" || item.gender === gender;

    const matchesOrigin =
      origin === "All" || item.origin === origin;

    return matchesSearch && matchesGender && matchesOrigin;
  });

  nameGrid.innerHTML = "";

  if (filtered.length === 0) {
    nameGrid.textContent = "No names found. Try another search.";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "name-card";

    const heading = document.createElement("h3");
    heading.textContent = item.name;

    const meaning = document.createElement("p");
    meaning.textContent = "Meaning: " + item.meaning;

    const details = document.createElement("p");
    details.textContent =
      item.gender + " • " + item.origin;

    const actions = document.createElement("div");
    actions.className = "name-actions";

    const favoriteButton = document.createElement("button");
    const isFavorite = favorites.includes(item.id);

    favoriteButton.textContent = isFavorite ? "♥ Saved" : "♡ Favorite";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));

    favoriteButton.addEventListener("click", () => {
      toggleFavorite(item.id);
    });

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";

    copyButton.addEventListener("click", async () => {
      const text =
        item.name + " – " + item.meaning;

      try {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = "Copied!";
      } catch {
        copyButton.textContent = "Copy unavailable";
      }
    });

    actions.append(favoriteButton, copyButton);
    card.append(heading, meaning, details, actions);
    nameGrid.appendChild(card);
  });
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(
    "namenestsFavorites",
    JSON.stringify(favorites)
  );

  displayNames();
}

searchInput.addEventListener("input", displayNames);
genderFilter.addEventListener("change", displayNames);
originFilter.addEventListener("change", displayNames);

// Start the generator
loadNames();
