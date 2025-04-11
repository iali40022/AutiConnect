// Helper functions for local storage

// Favorites/saved responses
export const saveResponse = (response) => {
  const favorites = getFavorites();
  favorites.push(response);
  localStorage.setItem("auticonnect_favorites", JSON.stringify(favorites));
  return response;
};

export const getFavorites = () => {
  const favorites = localStorage.getItem("auticonnect_favorites");
  return favorites ? JSON.parse(favorites) : [];
};

export const deleteFavorite = (id) => {
  const favorites = getFavorites();
  const filteredFavorites = favorites.filter((f) => f.id !== id);
  localStorage.setItem(
    "auticonnect_favorites",
    JSON.stringify(filteredFavorites)
  );
};

// Settings
export const saveSettings = (settings) => {
  localStorage.setItem("auticonnect_settings", JSON.stringify(settings));
  return settings;
};

export const getSettings = () => {
  const settings = localStorage.getItem("auticonnect_settings");
  if (!settings) {
    return {
      fontSize: "medium",
    };
  }
  return JSON.parse(settings);
};
