import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setConnected, pushMessage } from '../store/slices/websocketSlice';

export default function useFinnhub(token) {
  const wsRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      return;
    }
    const url = `wss://ws.finnhub.io?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => dispatch(setConnected(true));
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        console.log("data", data)
        dispatch(pushMessage(data));
      } catch (e) {
        console.error('WS parse error', e);
      }
    };
    ws.onclose = () => dispatch(setConnected(false));
    ws.onerror = () => dispatch(setConnected(false));

    return () => {
      try { ws.close(); } catch (e) { }
    };
  }, [token, dispatch]);

  const subscribe = (symbol) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
    return true;
  };

  const unsubscribe = (symbol) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    return true;
  };

  return { subscribe, unsubscribe, wsRef };
}
