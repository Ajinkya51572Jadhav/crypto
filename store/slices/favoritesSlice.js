import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'crypto_favorites_v1';

const load = () => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const save = (arr) => {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) { }
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { ids: load() },
  reducers: {
    toggleFavorite(state, action) {
      const id = action.payload;
      const idx = state.ids.indexOf(id);
      if (idx === -1) state.ids.push(id);
      else state.ids.splice(idx, 1);
      save(state.ids);
    },
    setFavorites(state, action) {
      state.ids = action.payload;
      save(state.ids);
    }
  }
});

export const { toggleFavorite, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;