import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type Market = {
  id: string;
  creator: { name: string; avatar: string; badge?: string };
  question: string;
  yesPool: number;
  noPool: number;
  volume: number;
  participants: number;
  timeRemaining: string;
  recentActivity: any[];
};

export type Trade = {
  id: string;
  marketId: string;
  user: string;
  avatar: string;
  side: 'YES' | 'NO';
  amount: number;
  time: number;
  badge?: string;
  level?: number;
  accuracy?: number;
};

export function useRealtimeMarkets(initialMarkets: Market[]) {
  const marketsRef = useRef<Market[]>(initialMarkets);
  const [version, setVersion] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Initialize ref if initialMarkets changes (optional, usually it's static)
    if (marketsRef.current.length === 0 && initialMarkets.length > 0) {
      marketsRef.current = initialMarkets;
      setTimeout(() => setVersion(v => v + 1), 0);
    }
  }, [initialMarkets]);

  useEffect(() => {
    const channel = supabase.channel('public:realtime');

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'markets' },
        (payload) => {
          const updatedMarket = payload.new as Market;
          if (!updatedMarket || !updatedMarket.id) return;

          const index = marketsRef.current.findIndex(m => m.id === updatedMarket.id);
          if (index !== -1) {
            // Atomic update
            marketsRef.current[index] = { ...marketsRef.current[index], ...updatedMarket };
            setVersion(v => v + 1); // Trigger minimal update
          } else if (payload.eventType === 'INSERT') {
            marketsRef.current = [updatedMarket, ...marketsRef.current];
            setVersion(v => v + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trades' },
        (payload) => {
          const newTrade = payload.new as Trade;
          if (!newTrade || !newTrade.id) return;

          setRecentTrades(prev => {
            const updated = [newTrade, ...prev];
            // Limit list size to avoid memory issues
            return updated.slice(0, 50);
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to realtime feed');
        }
        if (status === 'CLOSED') {
          console.log('Disconnected from realtime feed');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error connecting to realtime feed');
          // Auto reconnect logic could be handled by supabase client automatically,
          // but we can also add custom reconnect logic if needed.
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateMarket = useCallback((id: string, data: Partial<Market>) => {
    const index = marketsRef.current.findIndex(m => m.id === id);
    if (index !== -1) {
      marketsRef.current[index] = { ...marketsRef.current[index], ...data };
      setVersion(v => v + 1);
    }
  }, []);

  return {
    getMarkets: () => marketsRef.current,
    version,
    recentTrades,
    updateMarket,
  };
}
