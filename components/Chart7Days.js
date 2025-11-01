import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { coinMarketChart } from '../utils/coingecko';

export default function Chart7Days({ coinId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await coinMarketChart(coinId, 7);
        const d = res.prices.map(([ts, price]) => ({ time: new Date(ts).toLocaleString(), price }));
        if (mounted) setData(d);
      } catch (e) {
        console.error(e);
      } finally { if (mounted) setLoading(false); }
    };
    if (coinId) load();
    return () => { mounted = false; };
  }, [coinId]);

  if (loading) return <div>Loading chart...</div>;
  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="time" tickFormatter={(t) => t.split(',')[0]} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
