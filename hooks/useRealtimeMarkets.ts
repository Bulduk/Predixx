import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type Market = {
  id: string;
  creator: { id: string; name: string; avatar: string; badge?: string };
  question: string;
  yesPool: number;
  noPool: number;
  volume: number;
  participants: number;
  timeRemaining: string;
  recentActivity: any[];
  likes?: number;
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
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, using simulated realtime feed');
      let animationFrameId: number;
      let lastUpdate = performance.now();
      
      const simulate = (time: number) => {
        if (time - lastUpdate > 800) {
          lastUpdate = time;
          
          const markets = marketsRef.current;
          if (markets.length === 0) return;
          
          const randomMarket = markets[Math.floor(Math.random() * markets.length)];
          const isYes = Math.random() > 0.5;
          const side = isYes ? 'YES' : 'NO';
          const amount = Math.floor(Math.random() * 500) + 10;
          
          // Update market
          const newYesPool = isYes ? randomMarket.yesPool + amount : randomMarket.yesPool;
          const newNoPool = !isYes ? randomMarket.noPool + amount : randomMarket.noPool;
          
          const index = marketsRef.current.findIndex(m => m.id === randomMarket.id);
          if (index !== -1) {
            marketsRef.current[index] = {
              ...marketsRef.current[index],
              yesPool: newYesPool,
              noPool: newNoPool,
              volume: randomMarket.volume + amount,
              participants: randomMarket.participants + (Math.random() > 0.7 ? 1 : 0)
            };
            setVersion(v => v + 1);
          }
          
          // Generate trade
          const isFollowedTraderActivity = Math.random() > 0.8;
          const followedTraders = ['CryptoWhale', 'TechInsider'];
          const activityUser = isFollowedTraderActivity 
            ? followedTraders[Math.floor(Math.random() * followedTraders.length)]
            : `User${Math.floor(Math.random() * 9999)}`;
            
          const TRADER_BADGES = ['Top 5%', 'High Accuracy', 'Whale', 'Sniper', 'Rising Star'];
          
          const newTrade: Trade = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            marketId: randomMarket.id,
            user: activityUser,
            avatar: `https://picsum.photos/seed/${activityUser.toLowerCase()}/32/32`,
            side: side,
            amount: amount,
            time: Date.now(),
            level: isFollowedTraderActivity ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 100) + 1,
            accuracy: isFollowedTraderActivity ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 40) + 50,
            badge: isFollowedTraderActivity ? TRADER_BADGES[Math.floor(Math.random() * 3)] : (Math.random() > 0.8 ? TRADER_BADGES[Math.floor(Math.random() * TRADER_BADGES.length)] : undefined)
          };
          
          setRecentTrades(prev => {
            const updated = [newTrade, ...prev];
            return updated.slice(0, 50);
          });
        }
        animationFrameId = requestAnimationFrame(simulate);
      };
      
      animationFrameId = requestAnimationFrame(simulate);
      
      return () => cancelAnimationFrame(animationFrameId);
    }

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
