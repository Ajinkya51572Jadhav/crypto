import React, { useEffect } from 'react';
import { Modal, List, Button, Tag } from 'antd';

export default function LiveModal({
  visible,
  onClose,
  symbol,
  messages,
  subscribe,
  unsubscribe,
}) {
  useEffect(() => {
    if (!symbol || !subscribe || !visible) return;

    //  Proper Finnhub symbol format (BINANCE:BTCUSDT)
    const formatted = symbol.startsWith('BINANCE:')
      ? symbol
      : `BINANCE:${symbol}`;

       console.log("formatted",formatted)

    subscribe(formatted);

    return () => {
      if (unsubscribe) unsubscribe(formatted);
    };
  }, [symbol, visible, subscribe, unsubscribe]);

  // Filter trade messages only (ignore pings)
  const tradeMessages = messages.filter((m) => m.type === 'trade');

  return (
    <Modal
      title={`Live feed: ${symbol}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {tradeMessages.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999' }}>
          Waiting for live data...
        </div>
      ) : (
        <List
          size="small"
          bordered
          dataSource={tradeMessages}
          renderItem={(m, i) => {
            const trade = m.data?.[0];
            if (!trade) return null;
            return (
              <List.Item key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Tag color="blue">{trade.s}</Tag>
                    <span style={{ fontWeight: 600 }}>
                      ${trade.p.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ color: '#888', fontSize: 12 }}>
                    Vol: {trade.v?.toFixed(4)}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
}
