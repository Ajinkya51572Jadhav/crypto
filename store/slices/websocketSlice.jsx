import { createSlice } from '@reduxjs/toolkit';

const wsSlice = createSlice({
  name: 'ws',
  initialState: {
    connected: false,
    subscriptions: [], // array of symbols
    messages: [] // incoming messages (most recent first)
  },
  reducers: {
    setConnected(state, action) { state.connected = action.payload; },
    addSubscription(state, action) {
      if (!state.subscriptions.includes(action.payload)) state.subscriptions.push(action.payload);
    },
    removeSubscription(state, action) {
      state.subscriptions = state.subscriptions.filter(s => s !== action.payload);
    },
    pushMessage(state, action) {
      state.messages.unshift(action.payload);
      if (state.messages.length > 500) state.messages.length = 500;
    },
    clearMessages(state) { state.messages = []; }
  }
});

export const { setConnected, addSubscription, removeSubscription, pushMessage, clearMessages } = wsSlice.actions;
export default wsSlice.reducer;