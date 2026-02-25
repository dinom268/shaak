"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  Zap, Trophy, Crown, BookOpen, X, Clock, UserCircle, Newspaper, LogOut
} from 'lucide-react';

// --- 1. TYPES & INTERFACES ---
interface Stock {
  price: number;
  history: { p: number }[];
  shares: number;
  color: string;
  name: string;
  volatility: number;
}

interface StocksState {
  ADITYA: Stock;
  SANJAY: Stock;
  AKASH: Stock;
  KAVIN: Stock;
  HARI: Stock;
}

type StockSymbol = keyof StocksState;

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [balance, setBalance] = useState(1000); 
  const [activeStock, setActiveStock] = useState<StockSymbol>('ADITYA');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAcademy, setShowAcademy] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<{name: string, balance: number}[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [feedback, setFeedback] = useState<{isCorrect: boolean, msg: string} | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [canCollect, setCanCollect] = useState(false);
  const [news, setNews] = useState({ msg: "Market is stable.", impact: "neutral" });

  const [stocks, setStocks] = useState<StocksState>({
    ADITYA: { price: 150, history: Array(20).fill({ p: 150 }), shares: 0, color: "#00e676", name: "ADITYA INDUSTRIES", volatility: 30 },
    SANJAY: { price: 800, history: Array(20).fill({ p: 800 }), shares: 0, color: "#2979ff", name: "SANJAY BANK", volatility: 95 },
    AKASH: { price: 150,  history: Array(20).fill({ p: 150 }),  shares: 0, color: "#ff1744", name: "AKASH Ltd", volatility: 60 },
    KAVIN: { price: 2000, history: Array(20).fill({ p: 2000 }), shares: 0, color: "#ffd700", name: "KAVIN STOCKS", volatility: 220 },
    HARI: { price: 500, history: Array(20).fill({ p: 500 }), shares: 0, color: "#f7931a", name: "HARI COMPANY", volatility: 120 }
  });

  const newsEvents = [
    { msg: "TECH BOOM: ADITYA INDUSTRIES SOARS!", target: "ADITYA" as const, impact: 0.3, type: "good" },
    { msg: "CYBER ATTACK ON AKASH Ltd!", target: "AKASH" as const, impact: -0.4, type: "bad" },
    { msg: "MARKET CRASH: EVERYTHING DROPS!", target: "all" as const, impact: -0.2, type: "bad" }
  ];

  const academyQuestions = [
    { q: "What is 'Inflation'?", options: ["Prices going up", "Prices going down"], a: "Prices going up", explain: "Inflation is the rate of increase in prices over a given period of time." },
    { q: "A 'Bull Market' means prices are...", options: ["Falling", "Rising"], a: "Rising", explain: "A bull market happens when stock prices have gone up 20% or more from the previous low for a sustained period of time." }
  ];

  // --- LOGIC ---
  const updateLeaderboard = () => {
    const users = Object.keys(localStorage)
      .filter(key => key.startsWith('shark_user_'))
      .map(key => ({ 
        name: key.replace('shark_user_', '').toUpperCase(), 
        balance: JSON.parse(localStorage.getItem(key)!).balance 
      }))
      .sort((a, b) => b.balance - a.balance);
    setLeaderboardData(users);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    const userKey = `shark_user_${userName.toLowerCase()}`;
    const saved = localStorage.getItem(userKey);
    
    if (saved) {
      const p = JSON.parse(saved);
      setBalance(p.balance);
      setStocks(prev => {
        const next = { ...prev };
        Object.keys(p.stocks).forEach(k => {
          const sym = k as StockSymbol;
          if (next[sym]) next[sym].shares = p.stocks[k].shares;
        });
        return next;
      });
    } else {
      setBalance(1000); 
    }
    setIsLoggedIn(true);
    updateLeaderboard();
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const loop = setInterval(() => {
      setStocks(prev => {
        const next = { ...prev };
        (Object.keys(next) as Array<StockSymbol>).forEach(k => {
          const s = next[k];
          const changePercent = (Math.random() * s.volatility - (s.volatility / 2)) / 1000;
          s.price = Math.max(1, Math.round(s.price * (1 + changePercent)));
          s.history = [...s.history.slice(1), { p: s.price }];
        });
        return next;
      });

      if (Math.random() > 0.9) {
        const event = newsEvents[Math.floor(Math.random() * newsEvents.length)];
        setNews({ msg: event.msg, impact: event.type });
        if (event.target !== "all") {
          const targetKey = event.target as StockSymbol;
          setStocks(prev => ({
            ...prev,
            [targetKey]: { ...prev[targetKey], price: Math.round(prev[targetKey].price * (1 + event.impact)) }
          }));
        }
      }

      const last = localStorage.getItem(`bonus_${userName.toLowerCase()}`);
      const diff = 18000000 - (Date.now() - parseInt(last || "0"));
      if (diff <= 0) { setCanCollect(true); setTimeLeft("READY"); }
      else { setTimeLeft(`${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`); setCanCollect(false); }
    }, 2500);
    return () => clearInterval(loop);
  }, [isLoggedIn, userName]);

  useEffect(() => {
    if (isLoggedIn) {
      const data = { balance, stocks: Object.fromEntries(Object.entries(stocks).map(([k, v]) => [k, { shares: v.shares }])) };
      localStorage.setItem(`shark_user_${userName.toLowerCase()}`, JSON.stringify(data));
    }
  }, [balance, stocks, isLoggedIn, userName]);

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] text-white p-6">
      <form onSubmit={handleLogin} className="bg-white/5 p-10 rounded-[32px] border border-white/10 w-full max-w-sm text-center shadow-2xl">
        <Crown size={48} className="mx-auto mb-6 text-blue-500" />
        <h1 className="text-xl font-black mb-8 italic uppercase tracking-widest text-blue-400">FINLAB SHAAK</h1>
        <input className="w-full bg-white/5 p-4 rounded-xl mb-4 border border-white/10 outline-none focus:border-blue-500 transition-all" placeholder="Enter Username..." value={userName} onChange={(e) => setUserName(e.target.value)} />
        <button className="w-full bg-blue-600 py-4 rounded-xl font-black hover:bg-blue-500 transition-colors">START TRADING</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-[#020408] text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 font-bold uppercase text-xs tracking-wider">
            <UserCircle size={20} className="text-blue-400"/> {userName}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => { updateLeaderboard(); setShowLeaderboard(true); }} className="hover:text-yellow-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase"><Trophy size={18}/> Rank</button>
            <button onClick={() => setShowAcademy(true)} className="hover:text-blue-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase"><BookOpen size={18}/> Learn</button>
            <div className="h-4 w-[1px] bg-white/10" />
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400 hover:text-red-300"><LogOut size={16}/> Switch User</button>
          </div>
        </div>

        {/* BALANCE & BONUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <p className="text-[10px] opacity-40 font-black uppercase mb-1">Available Money</p>
            <h2 className="text-3xl font-mono font-black text-emerald-400 italic">₹{balance.toLocaleString()}</h2>
          </div>
          <button onClick={() => { if(canCollect) { setBalance(b => b + 2500); localStorage.setItem(`bonus_${userName.toLowerCase()}`, Date.now().toString()); }}} 
            className={`p-6 rounded-3xl border-2 transition-all flex justify-between items-center ${canCollect ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'}`}>
            <div className="flex items-center gap-3 text-left"><Clock size={24}/> <div><p className="text-[10px] font-black uppercase">Daily Reward</p><p className="text-xl font-black">{timeLeft}</p></div></div>
            {canCollect && <Zap size={24} className="animate-bounce" />}
          </button>
        </div>

        {/* NEWS TICKER */}
        <div className="p-4 rounded-2xl bg-blue-900/10 border border-blue-500/20 flex items-center gap-3">
          <Newspaper size={18} className="text-blue-400 shrink-0"/>
          <p className="text-xs font-black uppercase italic truncate tracking-tight">{news.msg}</p>
        </div>

        {/* MAIN GAME AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pb-10">
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2 scrollbar-hide">
            {(Object.keys(stocks) as Array<StockSymbol>).map(sym => (
              <button key={sym} onClick={() => setActiveStock(sym)} className={`w-full p-4 rounded-2xl border transition-all ${activeStock === sym ? 'bg-white/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                <div className="flex justify-between font-black text-[11px] mb-1"><span>{sym}</span><span className="text-emerald-400">₹{stocks[sym].price}</span></div>
                <p className="text-[9px] text-left opacity-30 font-bold uppercase">{stocks[sym].shares} Units Bought</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white/5 rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-white/30 font-black uppercase text-[10px] tracking-widest mb-1 italic">{stocks[activeStock].name}</h3>
                   <p className="text-5xl font-mono font-black tracking-tighter italic">₹{stocks[activeStock].price}</p>
                </div>
                <div className="text-right bg-white/5 p-3 rounded-xl border border-white/5">
                   <p className="text-[9px] font-black opacity-30 uppercase">Portfolio</p>
                   <p className="text-xl font-black font-mono">{stocks[activeStock].shares}</p>
                </div>
             </div>
             <div className="h-64 mb-8">
               <ResponsiveContainer><LineChart data={stocks[activeStock].history}><Line type="monotone" dataKey="p" stroke={stocks[activeStock].color} strokeWidth={4} dot={false} animationDuration={300} /></LineChart></ResponsiveContainer>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { if(balance >= stocks[activeStock].price) { setBalance(b => b - stocks[activeStock].price); setStocks({...stocks, [activeStock]: {...stocks[activeStock], shares: stocks[activeStock].shares + 1}}); }}} className="py-5 rounded-2xl bg-emerald-500 text-black font-black text-lg active:scale-95 transition-all hover:bg-emerald-400 shadow-lg shadow-emerald-500/10">BUY</button>
                <button onClick={() => { if(stocks[activeStock].shares > 0) { setBalance(b => b + stocks[activeStock].price); setStocks({...stocks, [activeStock]: {...stocks[activeStock], shares: stocks[activeStock].shares - 1}}); }}} className="py-5 rounded-2xl bg-red-500 text-white font-black text-lg active:scale-95 transition-all hover:bg-red-400 shadow-lg shadow-red-500/10">SELL</button>
             </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
            <div className="bg-[#0f1218] p-8 rounded-[32px] w-full max-w-md border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic text-yellow-500 flex items-center gap-2"><Trophy size={20}/> Global Rankings</h2>
                <button onClick={() => setShowLeaderboard(false)} className="bg-white/5 p-2 rounded-full"><X size={20}/></button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {leaderboardData.map((user, i) => (
                  <div key={i} className={`flex justify-between items-center p-5 rounded-2xl border ${user.name === userName.toUpperCase() ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black italic opacity-20">{i+1}</span>
                      <span className="font-bold uppercase text-sm tracking-tight">{user.name}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">₹{user.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAcademy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1218] p-10 rounded-[40px] w-full max-w-md border border-white/10 text-center">
              {!feedback ? (
                <>
                  <h3 className="font-black text-lg mb-8 uppercase italic tracking-tight">{academyQuestions[currentQ].q}</h3>
                  <div className="space-y-3">{academyQuestions[currentQ].options.map(opt => (<button key={opt} onClick={() => { if(opt === academyQuestions[currentQ].a) { setFeedback({isCorrect: true, msg: "Genius! Next lesson incoming..."}); setTimeout(() => { if(currentQ < 1) { setCurrentQ(currentQ+1); setFeedback(null); } else { setBalance(b => b + 5000); setShowAcademy(false); setCurrentQ(0); setFeedback(null); }}, 1500); } else { setFeedback({isCorrect: false, msg: academyQuestions[currentQ].explain}); }}} className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 font-bold transition-all">{opt}</button>))}</div>
                </>
              ) : (
                <div className="py-6">
                   <h2 className={`text-4xl font-black mb-4 italic ${feedback.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{feedback.isCorrect ? "CORRECT!" : "TRY AGAIN"}</h2>
                   <p className="font-bold opacity-60 mb-8 px-4">{feedback.msg}</p>
                   {!feedback.isCorrect && <button onClick={() => setFeedback(null)} className="bg-white text-black px-12 py-3 rounded-xl font-black uppercase shadow-xl">Retry</button>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}