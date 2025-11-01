import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import coinsReducer from './slices/coinsSlice';
import favoritesReducer from './slices/favoritesSlice';
import wsReducer from './slices/websocketSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      coins: coinsReducer,
      favorites: favoritesReducer,
      ws: wsReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });

export const wrapper = createWrapper(makeStore);