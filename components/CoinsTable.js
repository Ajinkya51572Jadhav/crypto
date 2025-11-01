import React, { useMemo, useCallback } from 'react';
import { Table, Tag, Button } from 'antd';
import Link from 'next/link';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { Typography } from 'antd';
const { Text, Link: AntLink } = Typography;

export default function CoinsTable({ data, loading, onPageChange }) {
  const dispatch = useDispatch();
  const favorites = useSelector(s => s.favorites.ids);

  const columns = useMemo(() => [
    {
      title: '', key: 'fav', width: 60, render: (_, record) => {
        const isFav = favorites.includes(record.id);
        return (
          <Button type="text" onClick={() => dispatch(toggleFavorite(record.id))}>
            {isFav ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
          </Button>
        );
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <img
            src={r.image}
            alt={r.name}
            style={{ width: 24, height: 24, borderRadius: '50%' }}
          />
          <div>
            <AntLink href={`/coin/${r.id}`} style={{ fontWeight: 600 }}>
              {r.name}
            </AntLink>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.symbol.toUpperCase()}
            </Text>
          </div>
        </div>
      ),
    }
    ,
    { title: 'Price (USD)', dataIndex: 'current_price', key: 'price', render: v => `$${v?.toLocaleString()}` },
    { title: '24h %', dataIndex: 'price_change_percentage_24h', key: 'change', render: v => <Tag color={v >= 0 ? 'green' : 'red'}>{v?.toFixed(2)}%</Tag> },
    { title: 'Market Cap', dataIndex: 'market_cap', key: 'mc', render: v => `$${(v || 0).toLocaleString()}` },
    { title: 'Volume (24h)', dataIndex: 'total_volume', key: 'vol', render: v => `$${(v || 0).toLocaleString()}` }
  ], [favorites, dispatch]);

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10, onChange: onPageChange }}
    />
  );
}
