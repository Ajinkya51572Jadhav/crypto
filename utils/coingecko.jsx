import axios from 'axios';

export const coingeckoMarkets = async (per_page = 50, page = 1) => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets';
  const res = await axios.get(url, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page,
      page,
      sparkline: false,
      price_change_percentage: '24h'
    },
    timeout: 10000
  });
  return res.data;
};

export const coinDetails = async (id) => {
  const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
    params: { localization: false, tickers: false, market_data: true, community_data: false, developer_data: false, sparkline: false },
    timeout: 10000
  });
  return res.data;
};

export const coinMarketChart = async (id, days = 7) => {
  const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
    params: { vs_currency: 'usd', days },
    timeout: 10000
  });
  return res.data;
};