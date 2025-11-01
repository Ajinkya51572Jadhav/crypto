import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoinDetail } from '../../store/slices/coinsSlice';
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Skeleton,
  Statistic,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  RiseOutlined,
  FallOutlined,
  GlobalOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import Chart7Days from '../../components/Chart7Days';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

export default function CoinDetail() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { detail, loading } = useSelector((s) => s.coins);
  const [livePrice, setLivePrice] = useState(null);
  const [sparkline, setSparkline] = useState([]);

  // Fetch coin data from Redux slice
  useEffect(() => {
    if (id) dispatch(fetchCoinDetail(id));
  }, [id, dispatch]);

  // Live updates from CoinGecko every 10 seconds
  useEffect(() => {
    if (!id) return;

    const fetchLive = async () => {
      try {
        const { data } = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${id}?localization=false&sparkline=true`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0', // prevents CORS/rate-limit issues
            },
          }
        );

        setLivePrice(data.market_data.current_price.usd);

        const spark = data.market_data.sparkline_7d.price.map((p, i) => ({
          time: i,
          value: p,
        }));
        setSparkline(spark);
      } catch (err) {
        console.error('Live update error:', err.message || err);
      }
    };

    //  Call only on client (browser)
    if (typeof window !== "undefined") {
      fetchLive();
      const interval = setInterval(fetchLive, 15000); // reduced to 15s
      return () => clearInterval(interval);
    }
  }, [id]);



  // useEffect(() => {
  //   if (!id) return;

  //   const fetchLive = async () => {
  //     try {
  //       const { data } = await axios.get(
  //         `https://api.coingecko.com/api/v3/coins/${id}?localization=false&sparkline=true`
  //       );
  //       setLivePrice(data.market_data.current_price.usd);
  //       const spark = data.market_data.sparkline_7d.price.map((p, i) => ({
  //         time: i,
  //         value: p,
  //       }));
  //       setSparkline(spark);
  //     } catch (err) {
  //       console.error('Live update error', err);
  //     }
  //   };

  //   fetchLive();
  //   const interval = setInterval(fetchLive, 10000); // refresh every 10s
  //   return () => clearInterval(interval);
  // }, [id]);

  if (loading || !detail) {
    return (
      <div style={{ padding: 32 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const desc =
    (detail.description?.en || '')
      .split('. ')
      .slice(0, 3)
      .join('. ') + '.';

  const price =
    livePrice ??
    detail.market_data?.current_price?.usd ??
    detail.market_data?.current_price?.usd;
  const marketCap = detail.market_data?.market_cap?.usd ?? 0;
  const change = detail.market_data?.price_change_percentage_24h ?? 0;
  const isUp = change >= 0;

  return (
    <div style={{ padding: '32px', background: '#f7f8fa', minHeight: '100vh' }}>
      {/* Back Button */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Button icon={<ArrowLeftOutlined />}>Back to Dashboard</Button>
      </Link>

      <Card
        style={{
          marginTop: 24,
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          background: '#fff',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Row gutter={[24, 24]} align="middle">
          {/* Coin Info */}
          <Col xs={24} sm={8} md={6}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <img
                src={detail.image?.large}
                alt={detail.name}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  marginBottom: 12,
                  border: '1px solid #eee',
                  background: '#fff',
                }}
              />
              <Title level={3} style={{ marginBottom: 0 }}>
                {detail.name}
              </Title>
              <Text type="secondary">{detail.symbol.toUpperCase()}</Text>

              <div style={{ marginTop: 16 }}>
                <Tag
                  color={isUp ? 'green' : 'red'}
                  icon={isUp ? <RiseOutlined /> : <FallOutlined />}
                >
                  {change.toFixed(2)}%
                </Tag>
              </div>
            </div>
          </Col>

          {/* Stats + Sparkline */}
          <Col xs={24} sm={16} md={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title={
                    <Space>
                      Current Price (USD)
                      <Tooltip title="Updated every 10 seconds">
                        <SyncOutlined spin style={{ fontSize: 14, color: '#1677ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  prefix="$"
                  value={price?.toLocaleString()}
                  precision={2}
                  valueStyle={{
                    color: isUp ? '#52c41a' : '#ff4d4f',
                    fontWeight: 600,
                  }}
                />
              </Col>

              <Col xs={24} sm={12}>
                <Statistic
                  title="Market Cap (USD)"
                  prefix="$"
                  value={marketCap.toLocaleString()}
                  precision={0}
                  valueStyle={{ fontWeight: 600 }}
                />
              </Col>
            </Row>

            {/* Inline Sparkline */}
            <div style={{ height: 60, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={isUp ? '#52c41a' : '#ff4d4f'}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Divider />

            <Paragraph style={{ color: '#595959', lineHeight: 1.6 }}>
              <Text strong>Description:</Text> <br />
              {desc.replace(/<\/?[^>]+(>|$)/g, '')}
            </Paragraph>

            <div style={{ marginTop: 20 }}>
              {detail.links?.homepage?.[0] && (
                <Button
                  type="primary"
                  icon={<GlobalOutlined />}
                  href={detail.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Website
                </Button>
              )}
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '32px 0' }} />

        {/* 7-Day Chart */}
        <div style={{ marginTop: 12 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            7-Day Price Trend
          </Title>
          <Card
            style={{
              borderRadius: 8,
              background: '#fafafa',
              border: '1px solid #f0f0f0',
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Chart7Days coinId={id} />
          </Card>
        </div>
      </Card>
    </div>
  );
}
