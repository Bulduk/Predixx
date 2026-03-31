'use client';

import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { House, ChartNoAxesColumn, Plus, Wallet, User, Ellipsis, Share2, MessageCircle, TrendingUp, X, CircleCheck, ArrowUpRight, ArrowDownRight, Clock, Heart, Trophy, Copy, Check, Gift, Rocket } from 'lucide-react';
import Image from 'next/image';
import { useRealtimeMarkets, Market } from '@/hooks/useRealtimeMarkets';

// --- Utility ---
const getPrices = (yesPool: number, noPool: number) => {
  const total = yesPool + noPool;
  if (total === 0) return { yesPrice: 0.50, noPrice: 0.50 };
  let yesPrice = yesPool / total;
  yesPrice = Math.max(0.01, Math.min(0.99, yesPrice));
  const noPrice = 1 - yesPrice;
  return { yesPrice, noPrice };
};

// --- Mock Data ---
const TRADER_BADGES = ['Top 5%', 'High Accuracy', 'Whale', 'Sniper', 'Rising Star'];

const MARKETS = [
  {
    id: '1',
    creator: { name: 'CryptoWhale', avatar: 'https://picsum.photos/seed/whale/100/100', badge: 'VIP' },
    question: 'Will Bitcoin hit $100k before May?',
    yesPool: 68000,
    noPool: 32000,
    volume: 2400000,
    participants: 1245,
    timeRemaining: '12d 4h',
    recentActivity: [
      { id: 'a1', user: 'Alex', avatar: 'https://picsum.photos/seed/u1/32/32', action: 'bought $500 YES', side: 'YES', amount: 500, level: 42, accuracy: 68, badge: 'Top 5%' },
      { id: 'a2', user: 'Sarah', avatar: 'https://picsum.photos/seed/u2/32/32', action: 'bought $150 NO', side: 'NO', amount: 150, level: 15, accuracy: 54, badge: null },
    ]
  },
  {
    id: '2',
    creator: { name: 'TechInsider', avatar: 'https://picsum.photos/seed/tech/100/100', badge: 'PRO' },
    question: 'Will Apple announce a foldable iPhone in 2026?',
    yesPool: 41000,
    noPool: 59000,
    volume: 850000,
    participants: 432,
    timeRemaining: '45d 12h',
    recentActivity: [
      { id: 'a3', user: 'Mike', avatar: 'https://picsum.photos/seed/u3/32/32', action: 'bought $1k NO', side: 'NO', amount: 1000, level: 89, accuracy: 72, badge: 'Whale' },
    ]
  },
  {
    id: '3',
    creator: { name: 'PolitiPredict', avatar: 'https://picsum.photos/seed/pol/100/100', badge: 'EXPERT' },
    question: 'Will the Fed cut rates in the next meeting?',
    yesPool: 82000,
    noPool: 18000,
    volume: 5100000,
    participants: 3890,
    timeRemaining: '3d 8h',
    recentActivity: [
      { id: 'a4', user: 'TraderX', avatar: 'https://picsum.photos/seed/u4/32/32', action: 'bought $2k YES', side: 'YES', amount: 2000, level: 55, accuracy: 61, badge: 'Sniper' },
      { id: 'a5', user: 'Emma', avatar: 'https://picsum.photos/seed/u5/32/32', action: 'bought $50 YES', side: 'YES', amount: 50, level: 8, accuracy: 49, badge: null },
    ]
  }
];

const MOCK_HISTORY = [
  { id: 'h1', question: 'Will ETH reach $4k in March?', side: 'YES', entryPrice: 45, result: 'WIN', pnl: 120, timestamp: '2 days ago' },
  { id: 'h2', question: 'Will SpaceX launch Starship this week?', side: 'NO', entryPrice: 30, result: 'LOSS', pnl: -50, timestamp: '1 week ago' },
  { id: 'h3', question: 'Will OpenAI release GPT-5 in 2025?', side: 'YES', entryPrice: 60, result: 'WIN', pnl: 80, timestamp: '2 weeks ago' },
];

// --- Components ---

const AnimatedNumber = memo(function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2, className = '' }: { value: number, prefix?: string, suffix?: string, decimals?: number, className?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const currentValue = useRef(value);

  useEffect(() => {
    let startTimestamp: number;
    let animationFrameId: number;
    const startValue = currentValue.current;
    const change = value - startValue;
    
    if (change === 0) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 300, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      currentValue.current = startValue + change * easeProgress;
      
      if (spanRef.current) {
        spanRef.current.textContent = `${prefix}${currentValue.current.toFixed(decimals)}${suffix}`;
      }
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        currentValue.current = value;
        if (spanRef.current) {
          spanRef.current.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
        }
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, prefix, suffix, decimals]);

  return <span ref={spanRef} className={className}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
});

const AnimatedCurrency = memo(function AnimatedCurrency({ value, className = '' }: { value: number, className?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const currentValue = useRef(value);

  useEffect(() => {
    let startTimestamp: number;
    let animationFrameId: number;
    const startValue = currentValue.current;
    const change = value - startValue;
    
    if (change === 0) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 300, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      currentValue.current = startValue + change * easeProgress;
      
      if (spanRef.current) {
        spanRef.current.textContent = formatCurrency(Math.round(currentValue.current));
      }
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        currentValue.current = value;
        if (spanRef.current) {
          spanRef.current.textContent = formatCurrency(Math.round(value));
        }
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span ref={spanRef} className={className}>{formatCurrency(Math.round(value))}</span>;
});

const SimpleLineChart = memo(function SimpleLineChart({ data, isPositive }: { data: number[], isPositive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const color = isPositive ? '#00FF88' : '#FF3366';

  return (
    <div className="w-full h-16 relative mt-6">
      <svg viewBox="0 -5 100 110" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

const TradeModal = memo(function TradeModal({ isOpen, onClose, market, initialSide, initialStake = 50, onConfirmTrade }: { isOpen: boolean, onClose: () => void, market: Market | null, initialSide: 'YES' | 'NO', initialStake?: number, onConfirmTrade: (marketId: string, side: 'YES' | 'NO', amount: number, price: number) => Promise<boolean> | void }) {
  const [stake, setStake] = useState(initialStake);
  const [side, setSide] = useState<'YES' | 'NO'>(initialSide);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStake(initialStake);
      setSide(initialSide);
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialSide, initialStake]);

  if (!market) return null;

  const currentYesPool = market.yesPool;
  const currentNoPool = market.noPool;
  const { yesPrice, noPrice } = getPrices(currentYesPool, currentNoPool);
  const yesPercent = yesPrice * 100;
  const noPercent = noPrice * 100;

  const price = side === 'YES' ? yesPercent : noPercent;
  const shares = stake > 0 ? Math.floor((stake / price) * 100) : 0;
  const potentialReturn = shares;
  const roi = stake > 0 ? (((potentialReturn - stake) / stake) * 100).toFixed(1) : "0.0";
  const fee = stake > 0 ? (stake * 0.02).toFixed(2) : "0.00"; // 2% mock fee

  const presetAmounts = [10, 50, 100, 500];

  const handleBuy = async () => {
    if (stake <= 0 || isSubmitting) return; // Prevent 0 or negative trades
    
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    setIsSubmitting(true);
    try {
      const success = await onConfirmTrade(market.id, side, stake, price);
      if (success !== false) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[95dvh] flex flex-col bg-black/40 backdrop-blur-3xl border-t border-white/20 rounded-t-[2.5rem] z-50 pb-safe shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Side-specific background glow */}
            <div 
              className={`absolute inset-0 opacity-20 transition-colors duration-500 pointer-events-none ${side === 'YES' ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yes/40 via-transparent to-transparent' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-no/40 via-transparent to-transparent'}`}
            />
            
            {/* Header / Drag Handle (Fixed at top of modal) */}
            <div className="relative z-20 shrink-0 pt-5 px-6 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-outfit font-bold leading-tight pr-4 drop-shadow-md">{market.question}</h2>
                <button onClick={onClose} className="glass-button p-2 shrink-0 hover:bg-white/20 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 overflow-y-auto px-6 pb-8 hide-scrollbar overscroll-contain flex-1">
              {/* Social Actions */}
              <div className="flex items-center gap-3 mb-6">
                <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Heart size={16} /> <span>1.2k</span>
                </button>
                <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <MessageCircle size={16} /> <span>342</span>
                </button>
                <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Share2 size={16} /> <span>Share</span>
                </button>
              </div>

              {/* Side Selector */}
              <div className="flex bg-black/40 p-1.5 rounded-2xl mb-6 border border-white/10 backdrop-blur-md shadow-inner">
                <button
                  onClick={() => setSide('YES')}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 ${side === 'YES' ? 'bg-yes text-black shadow-[0_0_20px_rgba(0,255,136,0.5)] scale-[1.02]' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                >
                  <span className="text-lg">YES</span>
                  <span className={`text-xs ${side === 'YES' ? 'text-black/70' : 'text-white/40'}`}>{Math.round(yesPercent)}¢</span>
                </button>
                <button
                  onClick={() => setSide('NO')}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 ${side === 'NO' ? 'bg-no text-white shadow-[0_0_20px_rgba(255,51,102,0.5)] scale-[1.02]' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                >
                  <span className="text-lg">NO</span>
                  <span className={`text-xs ${side === 'NO' ? 'text-white/70' : 'text-white/40'}`}>{Math.round(noPercent)}¢</span>
                </button>
              </div>

              {/* Input Field */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 backdrop-blur-md shadow-lg">
                <div className="flex justify-between text-sm text-white/50 mb-3 font-medium">
                  <span>Investment Amount</span>
                  <span className="flex items-center gap-1"><Wallet size={14} /> $1,240.50</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-outfit font-bold ${side === 'YES' ? 'text-yes/50' : 'text-no/50'}`}>$</span>
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="bg-transparent text-5xl font-outfit font-bold w-full outline-none text-white placeholder-white/20"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="flex gap-2 mb-6">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setStake(amount)}
                    className={`flex-1 py-2.5 rounded-xl border font-outfit font-semibold transition-all ${stake === amount ? (side === 'YES' ? 'bg-yes/20 border-yes/50 text-yes shadow-[0_0_10px_rgba(0,255,136,0.2)]' : 'bg-no/20 border-no/50 text-no shadow-[0_0_10px_rgba(255,51,102,0.2)]') : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10'}`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-8 bg-black/40 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 font-medium">Est. Shares</span>
                  <span className="font-outfit font-semibold text-white">{shares}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 font-medium">Fee (2%)</span>
                  <span className="font-outfit font-semibold text-white/70">${fee}</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-white/70 font-medium">Potential Return</span>
                  <div className="text-right">
                    <div className={`font-outfit font-bold text-2xl drop-shadow-md ${side === 'YES' ? 'text-yes text-glow-yes' : 'text-no text-glow-no'}`}>
                      ${potentialReturn.toFixed(2)}
                    </div>
                    <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${side === 'YES' ? 'bg-yes/20 text-yes' : 'bg-no/20 text-no'}`}>
                      +{roi}% ROI
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleBuy}
                disabled={isSuccess || stake <= 0}
                className={`w-full py-4.5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${
                  stake <= 0 
                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    : isSuccess 
                      ? (side === 'YES' ? 'bg-yes text-black shadow-[0_0_40px_rgba(0,255,136,0.8)] scale-105' : 'bg-no text-white shadow-[0_0_40px_rgba(255,51,102,0.8)] scale-105')
                      : (side === 'YES' ? 'bg-yes text-black shadow-[0_0_20px_rgba(0,255,136,0.4)] active:scale-95' : 'bg-no text-white shadow-[0_0_20px_rgba(255,51,102,0.4)] active:scale-95')
                }`}
              >
                {!isSuccess && stake > 0 && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  {isSuccess ? (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="flex items-center gap-2"
                    >
                      <CircleCheck size={24} />
                      Position Opened
                    </motion.span>
                  ) : (
                    <>
                      <span>Confirm {side}</span>
                      <span className="opacity-70 font-medium text-sm bg-black/20 px-2 py-0.5 rounded-lg">@ {price}¢</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const CircularIndicator = memo(function CircularIndicator({ yesPool, noPool, flashSide, volume = 0, resolvedState }: { yesPool: number, noPool: number, flashSide: 'YES' | 'NO' | null, volume?: number, resolvedState?: { result: 'YES' | 'NO', payout: number } }) {
  const radius = 130;
  const strokeWidth = 18;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const circleRef = useRef<SVGCircleElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);

  const { yesPrice, noPrice } = getPrices(yesPool, noPool);
  const yesPercent = yesPrice * 100;
  const noPercent = noPrice * 100;

  const isYesDominant = resolvedState ? resolvedState.result === 'YES' : yesPercent > noPercent;
  const isNeutral = resolvedState ? false : yesPercent === noPercent;
  const dominantPercent = resolvedState ? 100 : (isNeutral ? 50 : (isYesDominant ? yesPercent : noPercent));
  const currentPercentRef = useRef(dominantPercent);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const speed = 8;
      currentPercentRef.current += (dominantPercent - currentPercentRef.current) * speed * delta;

      if (circleRef.current) {
        const offset = circumference - (currentPercentRef.current / 100) * circumference;
        circleRef.current.style.strokeDashoffset = `${offset}`;
      }
      if (percentTextRef.current) {
        percentTextRef.current.textContent = `${Math.round(currentPercentRef.current)}%`;
      }

      if (Math.abs(dominantPercent - currentPercentRef.current) > 0.1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        currentPercentRef.current = dominantPercent;
        if (circleRef.current) {
          const offset = circumference - (dominantPercent / 100) * circumference;
          circleRef.current.style.strokeDashoffset = `${offset}`;
        }
        if (percentTextRef.current) {
          percentTextRef.current.textContent = `${Math.round(dominantPercent)}%`;
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dominantPercent, circumference]);

  const colorVar = isNeutral ? '#888888' : (isYesDominant ? 'var(--color-yes)' : 'var(--color-no)');
  const glowColor = isNeutral ? 'rgba(136,136,136,0.4)' : (isYesDominant ? 'rgba(0,255,136,0.4)' : 'rgba(255,51,102,0.4)');
  const pressureText = resolvedState ? `RESOLVED ${resolvedState.result}` : (isNeutral ? 'NEUTRAL ⟷' : (isYesDominant ? 'BUY PRESSURE ↑' : 'SELL PRESSURE ↓'));
  const pressureColor = isNeutral ? 'text-white/50' : (isYesDominant ? 'text-yes' : 'text-no');

  let signal = "EARLY";
  let signalColor = "text-blue-400 border-blue-400/30 bg-blue-400/10";
  if (volume > 2000000) {
    signal = "HOT";
    signalColor = "text-orange-400 border-orange-400/30 bg-orange-400/10";
  } else if (volume > 1000000) {
    signal = "TRENDING";
    signalColor = "text-purple-400 border-purple-400/30 bg-purple-400/10";
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[280px] aspect-square mx-auto my-6">
      {/* Signal Badge */}
      <div className={`absolute top-0 z-20 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest backdrop-blur-md shadow-lg ${signalColor}`}>
        {signal}
      </div>

      {/* Outer Glow Ring */}
      <div
        className="absolute inset-0 rounded-full -z-10 transition-all duration-300"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: flashSide ? 0.8 : 0.2,
          transform: flashSide ? 'scale(1.05)' : 'scale(1)'
        }}
      />

      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]"
      >
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorVar} stopOpacity="1" />
            <stop offset="100%" stopColor={colorVar} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Background Ring */}
        <circle
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Active Ring */}
        <circle
          ref={circleRef}
          stroke="url(#ring-grad)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-colors duration-500"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
        <div
          className="flex flex-col items-center transition-transform duration-300"
          style={{ transform: flashSide ? 'scale(1.05)' : 'scale(1)' }}
        >
          <span
            ref={percentTextRef}
            className={`text-7xl font-outfit font-bold tracking-tighter ${isNeutral ? 'text-white' : (isYesDominant ? 'text-yes text-glow-yes' : 'text-no text-glow-no')}`}
            style={{ textShadow: `0 0 40px ${glowColor}` }}
          >
            {Math.round(dominantPercent)}%
          </span>

          <span className={`mt-1 text-xs font-bold tracking-widest ${pressureColor}`}>
            {pressureText}
          </span>

          <span className="mt-2 text-[11px] font-medium text-white/60 bg-black/40 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            {formatCurrency(volume)} Vol
          </span>
        </div>
      </div>
    </div>
  );
});

const FeedItem = memo(function FeedItem({ market, isActive, onTrade, position, onOpenTrader, onCopyTrade, resolvedState }: { market: Market, isActive: boolean, onTrade: (market: Market, side: 'YES' | 'NO') => void, position?: { side: 'YES' | 'NO', amount: number, price: number }, onOpenTrader: (trader: any) => void, onCopyTrade: (market: Market, side: 'YES' | 'NO', amount: number) => void, resolvedState?: { result: 'YES' | 'NO', payout: number } }) {
  
  const currentYesPool = market.yesPool;
  const currentNoPool = market.noPool;
  const currentVolume = market.volume;
  const currentParticipants = market.participants;
  
  const [flashSide, setFlashSide] = useState<'YES' | 'NO' | null>(null);
  const prevYesPool = useRef(currentYesPool);
  const prevNoPool = useRef(currentNoPool);

  useEffect(() => {
    if (currentYesPool > prevYesPool.current) {
      setTimeout(() => setFlashSide('YES'), 0);
      const timer = setTimeout(() => setFlashSide(null), 500);
      prevYesPool.current = currentYesPool;
      return () => clearTimeout(timer);
    }
    if (currentNoPool > prevNoPool.current) {
      setTimeout(() => setFlashSide('NO'), 0);
      const timer = setTimeout(() => setFlashSide(null), 500);
      prevNoPool.current = currentNoPool;
      return () => clearTimeout(timer);
    }
  }, [currentYesPool, currentNoPool]);

  const { yesPrice, noPrice } = getPrices(currentYesPool, currentNoPool);
  const currentYes = yesPrice * 100;
  const currentNo = noPrice * 100;
  
  const [activities, setActivities] = useState(market.recentActivity);

  // We no longer update activities with liveUpdate.newActivity to prevent layout shifting
  // The new activities are shown as floating toasts instead.

  return (
    <div className={`w-full h-[100dvh] snap-start snap-always flex flex-col relative pb-24 pt-safe transition-opacity duration-1000 ${resolvedState ? 'opacity-50' : 'opacity-100'}`}>
      {/* Background subtle gradient based on dominance (Optimized) */}
      <motion.div 
        animate={{ opacity: flashSide ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 z-0 pointer-events-none ${flashSide === 'YES' ? 'bg-yes' : flashSide === 'NO' ? 'bg-no' : 'bg-transparent'}`}
      />
      <div 
        className={`absolute inset-0 opacity-10 bg-gradient-to-b ${currentYes > 50 ? 'from-yes/20 to-transparent' : 'from-no/20 to-transparent'} pointer-events-none`}
      />

      {/* Resolved Overlay */}
      <AnimatePresence>
        {resolvedState && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className={`px-8 py-4 rounded-2xl backdrop-blur-xl border-2 font-outfit font-bold text-3xl shadow-2xl ${
              resolvedState.result === 'YES' ? 'bg-yes/20 border-yes text-yes shadow-[0_0_50px_rgba(0,255,136,0.3)]' : 'bg-no/20 border-no text-no shadow-[0_0_50px_rgba(255,51,102,0.3)]'
            }`}>
              RESOLVED {resolvedState.result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center: Question & Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl md:text-3xl font-outfit font-bold text-center leading-tight mb-6"
        >
          {market.question}
        </motion.h1>
        
        <motion.button
          onClick={() => !resolvedState && onTrade(market, 'YES')}
          disabled={!!resolvedState}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0 }}
          whileHover={{ scale: resolvedState ? 1 : 1.05 }}
          whileTap={{ scale: resolvedState ? 1 : 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.3 }}
          className={`w-full relative group ${resolvedState ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {position && (
            <motion.div 
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full -z-10"
              style={{ background: `radial-gradient(circle, ${position.side === 'YES' ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'} 0%, transparent 70%)` }}
            />
          )}
          <CircularIndicator yesPool={currentYesPool} noPool={currentNoPool} flashSide={flashSide} volume={currentVolume} resolvedState={resolvedState} />
          
          {/* Tap to Trade Hint */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-bold tracking-widest text-white/50 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              Tap to Trade
            </span>
          </div>
        </motion.button>
      </div>

      {/* Social Activity Layer */}
      <div className="px-6 mb-4 z-10 h-12 relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1 - (i * 0.3), y: i * -8, scale: 1 - (i * 0.05), zIndex: 10 - i }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute left-0 right-0 flex items-center justify-center gap-2"
            >
              <div 
                className="glass-button px-3 py-1.5 flex items-center gap-2 border-white/10 bg-black/40 cursor-pointer"
                onClick={() => onOpenTrader(activity)}
              >
                <Image src={activity.avatar} alt={activity.user} width={20} height={20} className="rounded-full" />
                <span className="text-xs text-white/80 flex items-center gap-1">
                  <span className="font-bold text-white">{activity.user}</span>
                  {activity.badge && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-primary/20 text-primary border border-primary/30 uppercase">
                      {activity.badge}
                    </span>
                  )}
                  <span>{activity.action}</span>
                </span>
                {activity.side === 'YES' ? <ArrowUpRight size={14} className="text-yes" /> : <ArrowDownRight size={14} className="text-no" />}
                <button 
                  onClick={(e) => { e.stopPropagation(); onCopyTrade(market, activity.side as 'YES' | 'NO', activity.amount || 50); }}
                  className="ml-2 text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  COPY
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Area: Creator & Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/40 to-transparent pb-safe h-48 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
          {/* Position Badge */}
          <AnimatePresence>
            {position && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border backdrop-blur-md mb-2 ${
                  position.side === 'YES' 
                    ? 'bg-yes/10 border-yes/30 text-yes shadow-[0_0_15px_rgba(0,255,136,0.2)]' 
                    : 'bg-no/10 border-no/30 text-no shadow-[0_0_15px_rgba(255,51,102,0.2)]'
                }`}
              >
                <CircleCheck size={16} />
                <span className="text-sm font-semibold">
                  You bought {position.side} @ {position.price}¢ (${position.amount})
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end justify-between">
            {/* Left: Creator Avatar */}
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenTrader(market.creator); }}
              className="relative group cursor-pointer shrink-0"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/50 transition-colors shadow-lg">
                <Image src={market.creator.avatar} alt={market.creator.name} width={48} height={48} className="object-cover" />
              </div>
            </button>

            {/* Right: Improved Stats */}
            <div className="flex flex-wrap justify-end gap-2">
              <div className="glass-panel px-3 py-2 flex flex-col items-end justify-center min-w-[80px]">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Volume</span>
                <span className="font-outfit font-bold text-sm text-white"><AnimatedCurrency value={currentVolume} /></span>
              </div>
              <div className="glass-panel px-3 py-2 flex flex-col items-end justify-center min-w-[80px]">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Traders</span>
                <span className="font-outfit font-bold text-sm text-white"><AnimatedNumber value={currentParticipants} decimals={0} /></span>
              </div>
              <div className="glass-panel px-3 py-2 flex flex-col items-end justify-center min-w-[80px]">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Ends In</span>
                <span className="font-outfit font-bold text-sm text-white">{market.timeRemaining}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Views ---
const PortfolioView = memo(function PortfolioView({ positions, markets, resolvedMarkets, userBalance }: { positions: Record<string, { side: 'YES' | 'NO', amount: number, price: number }>, markets: Market[], resolvedMarkets: Record<string, { result: 'YES' | 'NO', payout: number }>, userBalance: number }) {
  const totalInvested = Object.values(positions).reduce((acc, pos) => acc + pos.amount, 0);
  
  // Calculate total current value
  const totalCurrentValue = Object.entries(positions).reduce((acc, [marketId, pos]) => {
    const market = markets.find(m => m.id === marketId);
    if (!market) return acc;
    
    if (resolvedMarkets[marketId]) {
      return acc + resolvedMarkets[marketId].payout;
    }

    const { yesPrice, noPrice } = getPrices(market.yesPool, market.noPool);
    const currentPrice = pos.side === 'YES' ? yesPrice * 100 : noPrice * 100;
    const shares = Math.floor((pos.amount / pos.price) * 100);
    return acc + ((shares * currentPrice) / 100);
  }, 0);
  
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const isPositive = totalPnl >= 0;
  const balance = userBalance + totalCurrentValue;

  // Mock graph data (starts at 1000, ends at current balance)
  const graphData = [1000, 1050, 1020, 1150, 1100, 1200, balance];

  return (
    <div className="h-full w-full overflow-y-auto pt-safe pb-24 px-4 space-y-6 hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mt-6 px-2">
        <h2 className="text-3xl font-outfit font-bold">Portfolio</h2>
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_0_15px_rgba(255,165,0,0.2)]">
          <span className="text-lg leading-none">🔥</span>
          <span className="text-sm font-bold text-orange-400">3 Wins</span>
        </div>
      </div>

      {/* Top Section & Graph */}
      <div className={`glass-panel p-6 relative overflow-hidden border transition-all duration-500 ${isPositive ? 'border-yes/30 shadow-[0_0_30px_rgba(0,255,136,0.15)]' : 'border-no/30 shadow-[0_0_30px_rgba(255,51,102,0.15)]'}`}>
        <div className="relative z-10">
          <p className="text-white/50 text-sm mb-1">Total Balance</p>
          <h3 className="text-4xl font-outfit font-bold flex items-center">
            $<AnimatedNumber value={balance} decimals={2} />
          </h3>
          
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-white/50 text-xs mb-1">Total PnL</p>
              <div className={`font-semibold flex items-center gap-1 ${isPositive ? 'text-yes text-glow-yes' : 'text-no text-glow-no'}`}>
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                $<AnimatedNumber value={Math.abs(totalPnl)} decimals={2} /> 
                <span className="text-xs opacity-80 ml-1">
                  (<AnimatedNumber value={Math.abs(totalPnlPercent)} decimals={1} prefix={isPositive ? '+' : '-'} suffix="%" />)
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs mb-1">Win Rate</p>
              <p className="font-semibold text-white">62.5%</p>
            </div>
          </div>
        </div>
        
        <SimpleLineChart data={graphData} isPositive={isPositive} />
      </div>

      {/* Insights Layer */}
      <div className="grid grid-cols-3 gap-3 px-1">
        <div className="glass-panel p-3 flex flex-col items-center justify-center text-center border border-white/5">
          <span className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Best Category</span>
          <span className="font-bold text-sm">Crypto</span>
        </div>
        <div className="glass-panel p-3 flex flex-col items-center justify-center text-center border border-white/5">
          <span className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Best Side</span>
          <span className="font-bold text-sm text-yes">YES</span>
        </div>
        <div className="glass-panel p-3 flex flex-col items-center justify-center text-center border border-white/5">
          <span className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Avg ROI</span>
          <span className="font-bold text-sm text-yes">+18.5%</span>
        </div>
      </div>

      {/* Active Positions */}
      <div>
        <h3 className="text-xl font-outfit font-bold mb-4 px-2">Active Positions</h3>
        {Object.keys(positions).length === 0 ? (
          <div className="glass-panel p-8 text-center border border-white/5 mx-1">
            <p className="text-white/50">No active positions.</p>
            <button className="mt-4 text-primary font-semibold text-sm">Explore Markets</button>
          </div>
        ) : (
          <div className="space-y-3 px-1">
            {Object.entries(positions).map(([marketId, pos]) => {
              const market = markets.find(m => m.id === marketId);
              if (!market) return null;
              
              const isResolved = !!resolvedMarkets[marketId];
              const resolvedData = resolvedMarkets[marketId];

              const { yesPrice, noPrice } = getPrices(market.yesPool, market.noPool);
              const currentPrice = isResolved 
                ? (resolvedData.result === pos.side ? 100 : 0)
                : (pos.side === 'YES' ? yesPrice * 100 : noPrice * 100);
              const shares = Math.floor((pos.amount / pos.price) * 100);
              const currentValue = isResolved ? resolvedData.payout : (shares * currentPrice) / 100;
              const pnl = currentValue - pos.amount;
              const pnlPercent = ((pnl / pos.amount) * 100);
              const isPosProfit = pnl >= 0;

              return (
                <motion.div 
                  key={marketId} 
                  whileTap={{ scale: 0.98 }}
                  className={`glass-panel p-4 border transition-colors duration-500 cursor-pointer ${
                    isResolved 
                      ? isPosProfit ? 'border-yes/50 bg-yes/10 shadow-[0_0_20px_rgba(0,255,136,0.1)]' : 'border-no/50 bg-no/10 shadow-[0_0_20px_rgba(255,51,102,0.1)]'
                      : isPosProfit ? 'border-yes/20 bg-yes/5 shadow-[0_0_15px_rgba(0,255,136,0.05)]' : 'border-no/20 bg-no/5 shadow-[0_0_15px_rgba(255,51,102,0.05)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-sm line-clamp-2 pr-4">{market.question}</p>
                    {isResolved && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${isPosProfit ? 'bg-yes text-black' : 'bg-no text-white'}`}>
                        RESOLVED {resolvedData.result}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${pos.side === 'YES' ? 'bg-yes/20 text-yes' : 'bg-no/20 text-no'}`}>
                          {pos.side}
                        </span>
                        <span className="text-xs text-white/50">Entry: {pos.price}¢</span>
                      </div>
                      <p className="text-white/50 text-[11px]">{shares} shares • ${pos.amount} invested</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-white/50 mb-1">
                        {isResolved ? 'Payout:' : 'Current:'} <span className="text-white font-bold">{isResolved ? `$${currentValue}` : `${currentPrice}¢`}</span>
                      </p>
                      <p className="font-outfit font-bold text-lg">
                        $<AnimatedNumber value={currentValue} decimals={2} />
                      </p>
                      <p className={`text-[11px] font-semibold flex items-center justify-end gap-1 mt-0.5 ${isPosProfit ? 'text-yes' : 'text-no'}`}>
                        {isPosProfit ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        $<AnimatedNumber value={Math.abs(pnl)} decimals={2} /> 
                        <span className="opacity-80">
                          (<AnimatedNumber value={Math.abs(pnlPercent)} decimals={1} prefix={isPosProfit ? '+' : '-'} suffix="%" />)
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade History */}
      <div>
        <h3 className="text-xl font-outfit font-bold mb-4 px-2">Trade History</h3>
        <div className="space-y-3 px-1">
          {MOCK_HISTORY.map((trade) => (
            <motion.div 
              key={trade.id}
              whileTap={{ scale: 0.98 }}
              className="glass-panel p-4 border border-white/5 flex flex-col gap-2 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <p className="font-medium text-sm line-clamp-2 flex-1">{trade.question}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${trade.result === 'WIN' ? 'bg-yes/20 text-yes border border-yes/30' : 'bg-no/20 text-no border border-no/30'}`}>
                  {trade.result}
                </span>
              </div>
              <div className="flex justify-between items-end mt-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${trade.side === 'YES' ? 'text-yes' : 'text-no'}`}>{trade.side}</span>
                  <span className="text-xs text-white/50">@ {trade.entryPrice}¢</span>
                </div>
                <div className="text-right">
                  <p className={`font-outfit font-bold ${trade.result === 'WIN' ? 'text-yes text-glow-yes' : 'text-no'}`}>
                    {trade.result === 'WIN' ? '+' : '-'}${Math.abs(trade.pnl).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">{trade.timestamp}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

const MarketsView = memo(function MarketsView({ onTrade, markets, resolvedMarkets }: { onTrade: (market: Market, side: 'YES' | 'NO') => void, markets: Market[], resolvedMarkets: Record<string, { result: 'YES' | 'NO', payout: number }> }) {
  return (
    <div className="h-full w-full overflow-y-auto pt-safe pb-24 px-6">
      <h2 className="text-3xl font-outfit font-bold mt-8 mb-6">Explore Markets</h2>
      <div className="space-y-4">
        {markets.map(market => {
          const isResolved = !!resolvedMarkets[market.id];
          const resolvedData = resolvedMarkets[market.id];
          const { yesPrice, noPrice } = getPrices(market.yesPool, market.noPool);
          const yesPercent = yesPrice * 100;
          const noPercent = noPrice * 100;
          return (
            <div key={market.id} className={`glass-panel p-4 relative overflow-hidden ${isResolved ? 'opacity-70' : ''}`}>
              {isResolved && (
                <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                  <span className={`px-4 py-1 rounded-full font-bold text-sm border ${resolvedData.result === 'YES' ? 'bg-yes/20 text-yes border-yes' : 'bg-no/20 text-no border-no'}`}>
                    RESOLVED {resolvedData.result}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <Image src={market.creator.avatar} alt="" width={20} height={20} className="rounded-full border border-white/10" />
                <span className="text-xs text-white/50">{market.creator.name}</span>
              </div>
              <h3 className="font-semibold mb-4 relative z-10">{market.question}</h3>
              <div className="flex gap-2 relative z-10">
                <button disabled={isResolved} onClick={() => onTrade(market, 'YES')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${isResolved ? 'bg-yes/5 text-yes/50 cursor-default' : 'bg-yes/10 hover:bg-yes/20 text-yes'}`}>YES {Math.round(yesPercent)}¢</button>
                <button disabled={isResolved} onClick={() => onTrade(market, 'NO')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${isResolved ? 'bg-no/5 text-no/50 cursor-default' : 'bg-no/10 hover:bg-no/20 text-no'}`}>NO {Math.round(noPercent)}¢</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const CreateView = memo(function CreateView() {
  return (
    <div className="h-full w-full overflow-y-auto pt-safe pb-24 px-6 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(123,97,255,0.3)]">
        <Plus size={32} className="text-primary" />
      </div>
      <h2 className="text-2xl font-outfit font-bold mb-2">Create a Market</h2>
      <p className="text-white/50 text-center mb-8 max-w-[250px]">Propose a new prediction market. Requires 500 USDC stake.</p>
      <button className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(123,97,255,0.4)]">Coming Soon</button>
    </div>
  );
});

const ProfileView = memo(function ProfileView({ userBalance }: { userBalance: number }) {
  const [copied, setCopied] = useState(false);
  const referralCode = "PREDIX_0x1";
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`https://predix.app/?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto pt-safe pb-24 px-6">
      <div className="flex flex-col items-center mt-12 mb-8">
        <Image src="https://picsum.photos/seed/you/100/100" alt="Profile" width={80} height={80} className="rounded-full border-2 border-primary mb-4 shadow-[0_0_20px_rgba(123,97,255,0.3)]" />
        <h2 className="text-2xl font-outfit font-bold">Trader_0x1</h2>
        <p className="text-white/50 text-sm">Joined March 2026</p>
      </div>
      
      <div className="glass-panel p-4 text-center mb-8">
        <p className="text-white/50 text-xs mb-1">Available Balance</p>
        <p className="text-3xl font-outfit font-bold text-primary text-glow-primary">${userBalance.toFixed(2)}</p>
      </div>

      {/* Referral Dashboard */}
      <div className="glass-panel p-5 mb-8 border border-yellow-500/30 shadow-[0_0_30px_rgba(255,215,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <h3 className="font-outfit font-bold text-lg mb-1 text-yellow-400">Invite & Earn</h3>
        <p className="text-white/60 text-xs mb-4">Get 50% of trading fees from your friends.</p>
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-wider">Total Referrals</p>
            <p className="font-bold text-xl">12</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[10px] uppercase tracking-wider">Earnings</p>
            <p className="font-bold text-xl text-yellow-400" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>$340.50</p>
          </div>
        </div>

        <button 
          onClick={handleCopy}
          className="w-full py-3 rounded-xl font-bold text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30 transition-colors flex items-center justify-center gap-2 relative z-10"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Referral Link'}
        </button>
      </div>

      {/* Leaderboard Preview */}
      <div className="glass-panel p-4 mb-8">
        <h3 className="font-outfit font-bold mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-400"/> Top Traders</h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'CryptoKing', profit: '+$45,200', isMe: false },
            { rank: 2, name: 'WhaleAlert', profit: '+$32,100', isMe: false },
            { rank: 3, name: 'Trader_0x1', profit: '+$1,240', isMe: true },
          ].map(user => (
            <div key={user.rank} className={`flex items-center justify-between p-2 rounded-lg ${user.isMe ? 'bg-white/10 border border-white/20' : ''}`}>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>#{user.rank}</span>
                <span className="font-semibold text-sm">{user.name} {user.isMe && '(You)'}</span>
              </div>
              <span className="text-yes font-bold text-sm">{user.profit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-panel p-4 text-center">
          <p className="text-white/50 text-xs mb-1">Win Rate</p>
          <p className="text-2xl font-outfit font-bold text-yes text-glow-yes">68%</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-white/50 text-xs mb-1">Markets Created</p>
          <p className="text-2xl font-outfit font-bold">0</p>
        </div>
      </div>
      
      <div className="glass-panel p-4">
        <h3 className="font-semibold mb-4">Settings</h3>
        <div className="space-y-4 text-sm text-white/70">
          <div className="flex justify-between items-center"><span className="flex items-center gap-2"><MessageCircle size={16}/> Notifications</span><span className="text-primary font-semibold">On</span></div>
          <div className="w-full h-[1px] bg-white/10" />
          <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Wallet size={16}/> Currency</span><span className="font-semibold">USD</span></div>
          <div className="w-full h-[1px] bg-white/10" />
          <div className="flex justify-between items-center"><span className="flex items-center gap-2"><User size={16}/> Theme</span><span className="font-semibold">Dark</span></div>
        </div>
      </div>
    </div>
  );
});

const BottomNav = memo(function BottomNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  const tabs = [
    { id: 'home', icon: House, label: 'Home' },
    { id: 'markets', icon: ChartNoAxesColumn, label: 'Markets' },
    { id: 'create', icon: Plus, label: 'Create', isCenter: true },
    { id: 'portfolio', icon: Wallet, label: 'Portfolio' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-safe z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t border-white/10" />
      <div className="relative flex justify-around items-end px-2 pb-4 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-4 flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.4)] transition-transform active:scale-95">
                  <Icon size={28} className="text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 p-2 w-16 transition-all active:scale-95"
            >
              <div className={`relative ${isActive ? 'text-primary' : 'text-white/50'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(123,97,255,0.8)]"
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-white/50'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

const TraderProfileModal = memo(function TraderProfileModal({ isOpen, onClose, trader, isFollowing, onToggleFollow }: { isOpen: boolean, onClose: () => void, trader: any, isFollowing: boolean, onToggleFollow: () => void }) {
  if (!trader) return null;

  // Deterministic pseudo-random values based on username
  const hash = trader.user.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const randomLevel = (hash % 100) + 1;
  const randomAccuracy = (hash % 40) + 50;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1A1B23] rounded-t-3xl p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex flex-col items-center mb-6">
              <Image src={trader.avatar} alt={trader.user} width={80} height={80} className="rounded-full border-2 border-primary/50 shadow-[0_0_20px_rgba(123,97,255,0.3)] mb-4" />
              <h2 className="text-2xl font-outfit font-bold text-white flex items-center gap-2">
                {trader.user}
                {trader.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-primary/20 text-primary border border-primary/30 uppercase">
                    {trader.badge}
                  </span>
                )}
              </h2>
              <p className="text-white/50 text-sm mt-1">Level {trader.level || randomLevel}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-panel p-4 flex flex-col items-center justify-center rounded-2xl">
                <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Win Rate</span>
                <span className="text-2xl font-outfit font-bold text-yes">{trader.accuracy || randomAccuracy}%</span>
              </div>
              <div className="glass-panel p-4 flex flex-col items-center justify-center rounded-2xl">
                <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Total Profit</span>
                <span className="text-2xl font-outfit font-bold text-yes">+$4,250</span>
              </div>
            </div>

            <button 
              onClick={onToggleFollow}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 mb-4 ${
                isFollowing 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-primary text-white shadow-[0_0_20px_rgba(123,97,255,0.4)] hover:bg-primary/90'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow Trader'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const BonusPopup = memo(function BonusPopup({ isOpen, onClose, amount }: { isOpen: boolean, onClose: () => void, amount: number }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-[#1A1B23] border border-yellow-500/30 rounded-3xl p-6 z-[60] shadow-[0_0_60px_rgba(255,215,0,0.2)] text-center overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-yellow-500/20 blur-[50px] pointer-events-none" />
            
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,215,0,0.4)] relative z-10">
              <Gift size={40} className="text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-outfit font-bold mb-2 text-white relative z-10">Welcome Bonus! 🎉</h2>
            <p className="text-white/70 text-sm mb-6 relative z-10">
              You received <span className="text-yellow-400 font-bold">${amount}</span> for joining via a referral link.
            </p>
            
            <button 
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.4)] relative z-10"
            >
              Start Trading
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const ShareModal = memo(function ShareModal({ data, onClose }: { data: { type: 'TRADE' | 'WIN', amount: number, marketQuestion: string } | null, onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(() => {
    const text = data?.type === 'WIN' 
      ? `I just made +$${data.amount.toFixed(2)} on Predix! 🚀\nJoin me: https://predix.app/?ref=PREDIX_0x1`
      : `I'm predicting to make +$${data?.amount.toFixed(2)} on Predix! 🚀\nJoin me: https://predix.app/?ref=PREDIX_0x1`;
      
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  return (
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#1A1B23] border border-yes/30 rounded-3xl p-6 z-[60] shadow-[0_0_50px_rgba(0,255,136,0.15)]"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yes/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                <Rocket size={32} className="text-yes" />
              </div>
              <h2 className="text-2xl font-outfit font-bold mb-2">
                {data.type === 'WIN' ? 'You Won! 🎉' : 'Trade Placed! 🚀'}
              </h2>
              <p className="text-white/70 text-sm line-clamp-2">
                {data.marketQuestion}
              </p>
            </div>

            <div className="glass-panel p-4 mb-6 text-center border-yes/30 bg-yes/5">
              <p className="text-xs text-white/50 mb-1">
                {data.type === 'WIN' ? 'Profit Made' : 'Potential Profit'}
              </p>
              <p className="text-4xl font-outfit font-bold text-yes text-glow-yes">
                +${data.amount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleCopy}
                className="w-full py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(123,97,255,0.4)]"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? 'Copied to Clipboard!' : 'Share & Earn Bonus'}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const TimeAgo = memo(function TimeAgo({ time }: { time: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const diff = now - time;
  if (diff < 2000) return <span className="text-primary font-bold animate-pulse">just now</span>;
  if (diff < 60000) return <span>{Math.floor(diff / 1000)}s ago</span>;
  return <span>{Math.floor(diff / 60000)}m ago</span>;
});

const UrgencyIndicator = memo(function UrgencyIndicator({ time, id }: { time: number, id: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const age = now - time;
  const timeLeft = Math.max(0, 15000 - age); // 15s window
  
  const missedPercent = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return (Math.abs(hash) % 15) + 2;
  }, [id]);

  if (timeLeft > 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF3B30] animate-pulse bg-[#FF3B30]/10 px-2 py-1 rounded-sm border border-[#FF3B30]/20 mt-2">
        <Clock size={10} />
        <span>Best entry window: {Math.ceil(timeLeft / 1000)}s left</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 bg-white/5 px-2 py-1 rounded-sm mt-2">
      <TrendingUp size={10} className="text-no" />
      <span>You missed +{missedPercent}% move</span>
    </div>
  );
});

const FollowingFeedItem = memo(function FollowingFeedItem({ activityGroup, onOpenTrader, onCopyTrade }: { activityGroup: any, onOpenTrader: (trader: any) => void, onCopyTrade: (market: Market, side: 'YES'|'NO', amount: number) => void }) {
  const [now, setNow] = useState(() => Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isTop5 = activityGroup.badge === 'Top 5%';
  const isHighAccuracy = activityGroup.accuracy > 70;
  
  return (
    <div
      className={`glass-panel relative overflow-hidden flex flex-col h-[260px] ${isHighAccuracy ? 'p-5 border-primary/40 shadow-[0_0_15px_rgba(123,97,255,0.1)]' : 'p-4 border-white/5'} ${isTop5 ? 'shadow-[0_0_30px_rgba(123,97,255,0.3)]' : ''}`}
    >
      {isTop5 && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      )}
      
      <div className="flex justify-between items-start mb-3 relative z-10 shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onOpenTrader(activityGroup)}
        >
          <Image src={activityGroup.avatar} alt={activityGroup.user} width={40} height={40} className={`rounded-full ${isTop5 ? 'border-2 border-primary shadow-[0_0_10px_rgba(123,97,255,0.5)]' : ''}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{activityGroup.user}</span>
              {activityGroup.badge && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-primary/20 text-primary border border-primary/30 uppercase">
                  {activityGroup.badge}
                </span>
              )}
            </div>
            <div className="text-xs text-white/50 flex items-center gap-2">
              <span>Lvl {activityGroup.level}</span>
              <span>•</span>
              <span className="text-yes">{activityGroup.accuracy}% Win Rate</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onOpenTrader(activityGroup)}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          Profile
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 relative z-10 hide-scrollbar pr-1">
        {activityGroup.trades.map((trade: any, idx: number) => {
          const market = MARKETS.find(m => m.id === trade.marketId);
          if (!market) return null;
          return (
            <div key={trade.id || idx} className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col relative overflow-hidden group">
              {/* Subtle pulse for new trades */}
              {now - trade.time < 5000 && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-sm font-medium line-clamp-2 flex-1">{market.question}</p>
                <div className="text-[10px] text-white/40 whitespace-nowrap shrink-0">
                  <TimeAgo time={trade.time} />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${trade.side === 'YES' ? 'bg-yes/20 text-yes' : 'bg-no/20 text-no'}`}>
                    {trade.side}
                  </span>
                  <span className="text-sm font-bold">
                    $<AnimatedNumber value={trade.amount} />
                  </span>
                </div>
                <button 
                  onClick={() => onCopyTrade(market, trade.side, trade.amount)}
                  className="text-[10px] font-bold px-4 py-1.5 rounded-full bg-primary hover:bg-primary/80 text-white transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(123,97,255,0.3)]"
                >
                  COPY
                </button>
              </div>
              
              <UrgencyIndicator time={trade.time} id={trade.id || String(idx)} />
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-white/30 uppercase tracking-widest font-bold flex justify-between shrink-0">
        <span>{activityGroup.trades[0]?.side === 'YES' ? 'Momentum building on YES' : 'High activity detected'}</span>
        <span className="text-primary/50 animate-pulse">Live</span>
      </div>
    </div>
  );
});

const FollowingFeed = memo(function FollowingFeed({ activities, onOpenTrader, onCopyTrade }: { activities: any[], onOpenTrader: (trader: any) => void, onCopyTrade: (market: Market, side: 'YES'|'NO', amount: number) => void }) {
  return (
    <div className="h-full w-full overflow-y-auto pt-24 pb-24 px-4 hide-scrollbar">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-white/50">
          <User size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-bold">No activity yet</p>
          <p className="text-sm">Follow traders to see their trades here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {activities.map(activityGroup => (
            <FollowingFeedItem 
              key={activityGroup.id} 
              activityGroup={activityGroup} 
              onOpenTrader={onOpenTrader} 
              onCopyTrade={onCopyTrade} 
            />
          ))}
        </div>
      )}
    </div>
  );
});

const LiveToasts = memo(function LiveToasts({ toasts }: { toasts: any[] }) {
  return (
    <div className="fixed top-24 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-2 pr-4 flex items-center gap-3 self-center shadow-2xl pointer-events-auto"
          >
            <Image src={toast.avatar} alt="User" width={24} height={24} className="rounded-full" />
            <span className="text-xs text-white">
              <span className="font-bold">{toast.user}</span> {toast.action}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

function useTradeEngine() {
  const isTradingRef = useRef(false);

  const placeTrade = useCallback(async (marketId: string, side: 'YES' | 'NO', amount: number) => {
    if (isTradingRef.current) return { success: false, error: 'Trade in progress' };
    
    isTradingRef.current = true;
    try {
      // Simulate Supabase RPC place_trade
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
      
      // Here you would normally call:
      // const { data, error } = await supabase.rpc('place_trade', { p_market_id: marketId, p_side: side, p_amount: amount });
      // if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Trade failed:', error);
      return { success: false, error: error.message || 'Trade failed' };
    } finally {
      isTradingRef.current = false;
    }
  }, []);

  return { placeTrade };
}

export default function Page() {
  const { placeTrade } = useTradeEngine();
  const [activeTab, setActiveTab] = useState('home');
  const [feedType, setFeedType] = useState<'foryou' | 'following'>('foryou');
  const [activeIndex, setActiveIndex] = useState(0);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [tradeSide, setTradeSide] = useState<'YES' | 'NO'>('YES');
  const [tradeStake, setTradeStake] = useState<number>(50);
  const [selectedTrader, setSelectedTrader] = useState<any | null>(null);
  const [positions, setPositions] = useState<Record<string, { side: 'YES' | 'NO', amount: number, price: number }>>({});
  const [toast, setToast] = useState<{ visible: boolean, side: 'YES' | 'NO', amount: number, price: number } | null>(null);
  const [liveToasts, setLiveToasts] = useState<any[]>([]);
  
  const { getMarkets, version, recentTrades, updateMarket } = useRealtimeMarkets(MARKETS);
  const markets = getMarkets();

  const [followedTraders, setFollowedTraders] = useState<string[]>(['CryptoWhale', 'TechInsider']);
  const [followingActivities, setFollowingActivities] = useState<any[]>(() => [
    {
      id: 'f1',
      user: 'CryptoWhale',
      avatar: 'https://picsum.photos/seed/whale/100/100',
      level: 99,
      accuracy: 82,
      badge: 'VIP',
      trades: [
        { marketId: '1', side: 'YES', amount: 5000, time: Date.now() - 1000 * 60 * 5 }
      ]
    },
    {
      id: 'f2',
      user: 'TechInsider',
      avatar: 'https://picsum.photos/seed/tech/100/100',
      level: 89,
      accuracy: 72,
      badge: 'PRO',
      trades: [
        { marketId: '2', side: 'NO', amount: 1000, time: Date.now() - 1000 * 60 * 15 }
      ]
    }
  ]);

  const handleToggleFollow = useCallback(() => {
    if (!selectedTrader) return;
    setFollowedTraders(prev => 
      prev.includes(selectedTrader.user) 
        ? prev.filter(u => u !== selectedTrader.user) 
        : [...prev, selectedTrader.user]
    );
  }, [selectedTrader]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync recentTrades to followingActivities and liveToasts
  useEffect(() => {
    if (recentTrades.length === 0) return;
    
    const latestTrade = recentTrades[0];
    
    // Add to live toasts
    setTimeout(() => {
      setLiveToasts(prev => {
        const next = [...prev, latestTrade];
        if (next.length > 3) return next.slice(next.length - 3);
        return next;
      });
      
      setTimeout(() => {
        setLiveToasts(prev => prev.filter(t => t.id !== latestTrade.id));
      }, 3000);

      // Add to following activities
      setFollowingActivities(prev => {
        const existingGroupIndex = prev.findIndex(g => g.user === latestTrade.user);
        const newTrade = { id: latestTrade.id, marketId: latestTrade.marketId, side: latestTrade.side, amount: latestTrade.amount, time: latestTrade.time };
        
        if (existingGroupIndex >= 0) {
          const newGroups = [...prev];
          newGroups[existingGroupIndex] = {
            ...newGroups[existingGroupIndex],
            trades: [newTrade, ...newGroups[existingGroupIndex].trades].slice(0, 5)
          };
          return newGroups;
        } else {
          return [{
            id: `group-${Date.now()}`,
            user: latestTrade.user,
            avatar: latestTrade.avatar,
            level: latestTrade.level || 1,
            accuracy: latestTrade.accuracy || 50,
            badge: latestTrade.badge,
            trades: [newTrade]
          }, ...prev].slice(0, 20);
        }
      });
    }, 0);
  }, [recentTrades]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollPosition = containerRef.current.scrollTop;
    const windowHeight = window.innerHeight;
    const index = Math.round(scrollPosition / windowHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const handleTrade = useCallback((market: Market, side: 'YES' | 'NO') => {
    setSelectedMarket(market);
    setTradeSide(side);
    setTradeStake(50);
    setTradeModalOpen(true);
  }, []);

  const handleCopyTrade = useCallback((market: Market, side: 'YES' | 'NO', amount: number) => {
    setSelectedMarket(market);
    setTradeSide(side);
    setTradeStake(amount);
    setTradeModalOpen(true);
  }, []);

  const handleOpenTrader = useCallback((trader: any) => {
    setSelectedTrader(trader);
  }, []);

  const [resolvedMarkets, setResolvedMarkets] = useState<Record<string, { result: 'YES' | 'NO', payout: number }>>({});
  const [userBalance, setUserBalance] = useState(1240.50);
  const [showBonus, setShowBonus] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ type: 'TRADE' | 'WIN', amount: number, marketQuestion: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      const hasClaimed = localStorage.getItem('predix_bonus_claimed');
      
      if (refCode && !hasClaimed) {
        localStorage.setItem('predix_ref', refCode);
        
        // Simulate signup flow & bonus
        setTimeout(() => {
          setShowBonus(true);
          setUserBalance(prev => prev + 50);
          localStorage.setItem('predix_bonus_claimed', 'true');
          localStorage.removeItem('predix_ref');
        }, 1500);
      }
    }
  }, []);

  const handleResolveMarket = useCallback((marketId: string, result: 'YES' | 'NO') => {
    const position = positions[marketId];
    let payout = 0;
    
    if (position) {
      if (position.side === result) {
        // Win
        const shares = Math.floor((position.amount / position.price) * 100);
        payout = shares; // 1 share = $1 on win
        setUserBalance(prev => prev + payout);
        
        setTimeout(() => {
          setShareModalData({
            type: 'WIN',
            amount: payout - position.amount,
            marketQuestion: MARKETS.find(m => m.id === marketId)?.question || ''
          });
        }, 1000);
      }
    }

    setResolvedMarkets(prev => ({ ...prev, [marketId]: { result, payout } }));
    
    // Show toast
    setToast({ 
      visible: true, 
      side: result, 
      amount: payout, 
      price: 100,
      isResolve: true,
      won: position?.side === result
    } as any);

    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, [positions]);

  const handleConfirmTrade = useCallback(async (marketId: string, side: 'YES' | 'NO', amount: number, price: number) => {
    const { success, error } = await placeTrade(marketId, side, amount);
    
    if (!success) {
      // Handle error (e.g., show error toast)
      console.error(error);
      return false;
    }

    setUserBalance(prev => prev - amount);
    setPositions(prev => ({ ...prev, [marketId]: { side, amount, price } }));
    setToast({ visible: true, side, amount, price });
    
    const shares = Math.floor((amount / price) * 100);
    const potentialPayout = shares;
    const profit = potentialPayout - amount;

    setTimeout(() => {
      setShareModalData({
        type: 'TRADE',
        amount: profit,
        marketQuestion: MARKETS.find(m => m.id === marketId)?.question || ''
      });
    }, 500);
    
    // Trigger immediate market reaction for the user's trade
    const marketData = markets.find(m => m.id === marketId);
    if (marketData) {
      const newYesPool = side === 'YES' ? marketData.yesPool + amount : marketData.yesPool;
      const newNoPool = side === 'NO' ? marketData.noPool + amount : marketData.noPool;
      
      updateMarket(marketId, {
        yesPool: newYesPool,
        noPool: newNoPool,
        volume: marketData.volume + amount,
        participants: marketData.participants + 1,
      });
    }

    // Auto-hide toast
    setTimeout(() => {
      setToast(null);
    }, 3000);

    return true;
  }, [markets, placeTrade, updateMarket]);

  return (
    <main className="h-[100dvh] w-full bg-background overflow-hidden relative">
      {/* Background glow (Optimized) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Feed Container */}
      {activeTab === 'home' && (
        <>
          <LiveToasts toasts={liveToasts} />
          {/* HEADER (Absolute to prevent layout shift) */}
          <div className="absolute top-safe left-0 right-0 z-40 flex justify-center pt-4 pointer-events-none">
            <div className="flex gap-6 pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
              <button 
                onClick={() => setFeedType('foryou')}
                className={`text-sm font-bold transition-all ${feedType === 'foryou' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/50 hover:text-white/80'}`}
              >
                For You
              </button>
              <button 
                onClick={() => setFeedType('following')}
                className={`text-sm font-bold transition-all ${feedType === 'following' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/50 hover:text-white/80'}`}
              >
                Following
              </button>
            </div>
          </div>

          {/* CONTENT (Full height for perfect snap) */}
          <div className="relative z-30 h-[100dvh] w-full">
            {feedType === 'foryou' ? (
              <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar"
              >
                {markets.map((market, index) => (
                  <div key={market.id} className="relative">
                    <FeedItem 
                      market={market} 
                      isActive={index === activeIndex} 
                      onTrade={handleTrade}
                      position={positions[market.id]}
                      onOpenTrader={handleOpenTrader}
                      onCopyTrade={handleCopyTrade}
                      resolvedState={resolvedMarkets[market.id]}
                    />
                    {/* DEV ONLY: Resolve Market Buttons */}
                    {index === activeIndex && !resolvedMarkets[market.id] && (
                      <div className="absolute top-24 right-4 z-50 flex flex-col gap-2">
                        <button 
                          onClick={() => handleResolveMarket(market.id, 'YES')}
                          className="bg-yes/20 text-yes border border-yes/50 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                        >
                          Resolve YES
                        </button>
                        <button 
                          onClick={() => handleResolveMarket(market.id, 'NO')}
                          className="bg-no/20 text-no border border-no/50 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                        >
                          Resolve NO
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <FollowingFeed 
                activities={followingActivities} 
                onOpenTrader={handleOpenTrader} 
                onCopyTrade={handleCopyTrade} 
              />
            )}
          </div>
        </>
      )}

      <div className="relative z-30 h-full">
        {activeTab === 'portfolio' && <PortfolioView positions={positions} markets={markets} resolvedMarkets={resolvedMarkets} userBalance={userBalance} />}
        {activeTab === 'markets' && <MarketsView onTrade={handleTrade} markets={markets} resolvedMarkets={resolvedMarkets} />}
        {activeTab === 'create' && <CreateView />}
        {activeTab === 'profile' && <ProfileView userBalance={userBalance} />}
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Modals */}
      <TradeModal 
        isOpen={tradeModalOpen} 
        onClose={() => setTradeModalOpen(false)} 
        market={selectedMarket} 
        initialSide={tradeSide} 
        initialStake={tradeStake}
        onConfirmTrade={handleConfirmTrade}
      />

      <TraderProfileModal
        isOpen={!!selectedTrader}
        onClose={() => setSelectedTrader(null)}
        trader={selectedTrader}
        isFollowing={selectedTrader ? followedTraders.includes(selectedTrader.user) : false}
        onToggleFollow={handleToggleFollow}
      />

      <BonusPopup isOpen={showBonus} onClose={() => setShowBonus(false)} amount={50} />
      <ShareModal data={shareModalData} onClose={() => setShareModalData(null)} />

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none w-[90%] max-w-md"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <div className={`glass-panel w-full px-6 py-4 flex items-center gap-4 border ${
              (toast as any).isResolve 
                ? (toast as any).won ? 'border-yes/50 shadow-[0_10px_40px_rgba(0,255,136,0.3)]' : 'border-no/50 shadow-[0_10px_40px_rgba(255,51,102,0.3)]'
                : toast.side === 'YES' ? 'border-yes/50 shadow-[0_10px_40px_rgba(0,255,136,0.3)]' : 'border-no/50 shadow-[0_10px_40px_rgba(255,51,102,0.3)]'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                (toast as any).isResolve
                  ? (toast as any).won ? 'bg-yes/20 text-yes' : 'bg-no/20 text-no'
                  : toast.side === 'YES' ? 'bg-yes/20 text-yes' : 'bg-no/20 text-no'
              }`}>
                <CircleCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white">{(toast as any).isResolve ? 'Market Resolved' : 'Trade Executed'}</h4>
                <p className="text-sm text-white/70">
                  {(toast as any).isResolve ? (
                    (toast as any).won ? (
                      <>You won <span className="text-yes font-bold">${toast.amount}</span></>
                    ) : (
                      <>You lost your position</>
                    )
                  ) : (
                    <>Bought <span className={toast.side === 'YES' ? 'text-yes font-bold' : 'text-no font-bold'}>{toast.side}</span> for ${toast.amount} @ {toast.price}¢</>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
