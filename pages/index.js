import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { wrapper } from '../store/store';
import { fetchCoins, setSearch, setSort, setPage } from '../store/slices/coinsSlice';
import { coingeckoMarkets } from '../utils/coingecko';
import CoinsTable from '../components/CoinsTable';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Select, Tag, Button, Space, Modal, Input } from 'antd';
import LiveModal from '../components/LiveModal';
import useFinnhub from '../hooks/useFinnhub';

const { Option } = Select;

function Home() {
  const dispatch = useDispatch();
  const { list, loading, search, sortBy, sortOrder } = useSelector((s) => s.coins);
  const favorites = useSelector((s) => s.favorites.ids);
  const wsMessages = useSelector((s) => s.ws.messages);
  const wsConnected = useSelector((s) => s.ws.connected);

  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [mounted, setMounted] = useState(false); //Prevent hydration mismatch

  const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN || "d42c7g1r01qorleqm4p0d42c7g1r01qorleqm4pg";
  const { subscribe, unsubscribe } = useFinnhub("d42c7g1r01qorleqm4p0d42c7g1r01qorleqm4pg");

  // Fetch top coins (SSR data already preloaded, but refresh client-side if needed)
  useEffect(() => {
    if (!list || list.length === 0) {
      dispatch(fetchCoins({ per_page: 50, page: 1 }));
    }
  }, [dispatch, list]);

  //  Mark as mounted to safely render client-only UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = useCallback(
    (value) => {
      dispatch(setSearch(value?.trim?.() || ''));
    },
    [dispatch]
  );


  const onSortChange = (val) => {
    if (!val) dispatch(setSort({ field: null, order: 'desc' }));
    else {
      const [field, order] = val.split(':');
      dispatch(setSort({ field, order }));
    }
  };

  const filtered = useMemo(() => {
    let data = [...list];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }
    if (sortBy) {
      data.sort((a, b) => {
        const av = a[sortBy] ?? 0;
        const bv = b[sortBy] ?? 0;
        return sortOrder === 'asc' ? av - bv : bv - av;
      });
    }
    return data;
  }, [list, search, sortBy, sortOrder]);

  const openLive = (symbol) => {
    const formatted = `BINANCE:${symbol}USDT`;
    setSelectedSymbol(formatted);
    setLiveOpen(true);
  };

  const closeLive = () => {
    // setSelectedSymbol(null);
    setLiveOpen(false);
  };

  return (
    <>
      <Row gutter={16}>
        {/* Left side: Coins table */}
        <Col xs={24} lg={16}>
          <Card title="Top 50 Cryptocurrencies">
            <Space style={{ marginBottom: 12 }}>

              <Input.Search
                placeholder="Search by name or symbol"
                allowClear
                enterButton="Search"
                onSearch={handleSearch}
              />


              <Select
                placeholder="Sort"
                onChange={onSortChange}
                style={{ width: 260 }}
                allowClear
              >
                <Option value="current_price:desc">Price (high → low)</Option>
                <Option value="current_price:asc">Price (low → high)</Option>
                <Option value="market_cap:desc">Market Cap (high → low)</Option>
                <Option value="market_cap:asc">Market Cap (low → high)</Option>
                <Option value="price_change_percentage_24h:desc">
                  24h % (high → low)
                </Option>
                <Option value="price_change_percentage_24h:asc">
                  24h % (low → high)
                </Option>
              </Select>
              <Tag color={wsConnected ? 'green' : 'red'}>
                {wsConnected ? 'Live: Connected' : 'Live: Disconnected'}
              </Tag>
              <Button onClick={() => dispatch(fetchCoins({ per_page: 50 }))}>
                Refresh
              </Button>
            </Space>

            <CoinsTable
              data={filtered}
              loading={loading}
              onPageChange={(p) => dispatch(setPage(p))}
            />
          </Card>
        </Col>

        {/* Right side: Favorites and Live Feed */}
        <Col xs={24} lg={8}>
          {/* Render Favorites only after mount */}
          {mounted && (
            <Card title="Favorites" style={{ marginBottom: 16 }}>
              {favorites?.length === 0 ? (
                <div>No favorites yet</div>
              ) : (
                <div>
                  {favorites?.map((id) => {
                    const coin = list.find((c) => c.id === id);
                    if (!coin) return null;
                    return (
                      <div
                        key={id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{coin.name}</div>
                          <div style={{ color: '#888' }}>
                            {coin.symbol.toUpperCase()} • ${coin.current_price.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          onClick={() => openLive(coin.symbol.toUpperCase())}
                        >
                          Live
                        </Button>
                      </div>
                    );
                  })}

                </div>
              )}
            </Card>
          )}

          <Card title="Live feed sample">
            <Button
              type="primary"
              onClick={() =>
                Modal.info({
                  title: 'How to use live feed',
                  content:
                    'Set NEXT_PUBLIC_FINNHUB_TOKEN in .env.local then click Live on a favorite.',
                })
              }
            >
              Info
            </Button>
            <div style={{ marginTop: 12 }}>
              {wsMessages
                .filter((m) => m.type === 'trade')
                .slice(0, 6)
                .map((m, i) => {
                  const trade = m.data?.[0];
                  if (!trade) return null;
                  if (trade.s !== selectedSymbol) return null;
                  const isUp = trade.p > 0;
                  const priceColor = isUp ? '#52c41a' : '#ff4d4f';

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#fafafa',
                        padding: '8px 12px',
                        borderRadius: 6,
                        marginBottom: 6,
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{trade.s}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {new Date(trade.t).toLocaleTimeString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: priceColor, fontWeight: 600 }}>
                          ${trade.p.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          Vol: {trade.v?.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Live Modal */}
      <LiveModal
        visible={liveOpen}
        onClose={closeLive}
        symbol={selectedSymbol}
        messages={wsMessages.filter(() => true)}
        subscribe={subscribe}
        unsubscribe={unsubscribe}
      />
    </>
  );
}

// SSR data hydration — works in /pages, not /app
export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    try {
      const data = await coingeckoMarkets(50, 1);
      await store.dispatch({ type: 'coins/setList', payload: data });
    } catch (e) {
      console.error('SSR fetch error', e);
    }
    return { props: {} };
  }
);

export default Home;

// export function Providers({ children }) {
//   return <Provider store={store}>{children}</Provider>
// }
