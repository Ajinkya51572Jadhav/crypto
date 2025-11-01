import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const COINGECKO_MARKETS = 'https://api.coingecko.com/api/v3/coins/markets';

export const fetchCoins = createAsyncThunk(
  'coins/fetchCoins',
  async ({ per_page = 50, page = 1 } = {}) => {
    const res = await axios.get(COINGECKO_MARKETS, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page,
        page,
        sparkline: false,
        price_change_percentage: '24h',
      }
    });
    return res.data;
  }
);

export const fetchCoinDetail = createAsyncThunk(
  'coins/fetchCoinDetail',
  async (id) => {
    const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
      params: { localization: false, tickers: false, market_data: true, community_data: false, developer_data: false, sparkline: false }
    });
    return res.data;
  }
);

const coinsSlice = createSlice({
  name: 'coins',
  initialState: {
    list: [],
    loading: false,
    error: null,
    search: '',
    sortBy: null,
    sortOrder: 'desc',
    page: 1,
    detail: null
  },
  reducers: {
    setSearch(state, action) { state.search = action.payload; },
    setSort(state, action) {
      state.sortBy = action.payload.field;
      state.sortOrder = action.payload.order || 'desc';
    },
    setPage(state, action) { state.page = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCoins.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchCoins.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(fetchCoinDetail.pending, (s) => { s.loading = true; s.error = null; s.detail = null; })
      .addCase(fetchCoinDetail.fulfilled, (s, a) => { s.loading = false; s.detail = a.payload; })
      .addCase(fetchCoinDetail.rejected, (s, a) => { s.loading = false; s.error = a.error.message; s.detail = null; });
  }
});

export const { setSearch, setSort, setPage } = coinsSlice.actions;
const coinsReducer = coinsSlice.reducer;
export default coinsReducer;