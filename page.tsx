"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  Zap, Trophy, Crown, BookOpen, X, Clock, Lightbulb, 
  TrendingUp, ArrowUpRight, UserCircle, Newspaper, Medal, Waves, Activity
} from 'lucide-react';

export default function DashboardPage() {
  // --- CORE STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [balance, setBalance] = useState(5000);
  const [theme, setTheme] = useState('cyber'); 
  const [activeStock, setActiveStock] = useState('ADITYA');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAcademy, setShowAcademy] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<{name: string, balance: number}[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [feedback, setFeedback] = useState<{isCorrect: boolean, msg: string} | null>(null);
  const [factIndex, setFactIndex] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");
  const [canCollect, setCanCollect] = useState(false);
  const [news, setNews] = useState({ msg: "Market is stable.", impact: "neutral" });

  const [stocks, setStocks] = useState({
    ADITYA: { price: 150, history: Array(20).fill({ p: 150 }), shares: 0, color: "#00e676", name: "ADITYA INDUSTRIES", volatility: 30 },
    SANJAY: { price: 800, history: Array(20).fill({ p: 800 }), shares: 0, color: "#2979ff", name: "SANJAY BANK", volatility: 95 },
    AKASH: { price: 150,  history: Array(20).fill({ p: 150 }),  shares: 0, color: "#ff1744", name: "AKASH Ltd", volatility: 60 },
    KAVIN: { price: 2000, history: Array(20).fill({ p: 2000 }), shares: 0, color: "#ffd700", name: "KAVIN STOCKS", volatility: 220 },
    HARI: { price: 500, history: Array(20).fill({ p: 500 }), shares: 0, color: "#f7931a", name: "HARI COMPANY", volatility: 120 }
  });

  const financeFacts = [
    "Inflation lowers your purchasing power over time.",
    "A 'Bear Market' is a 20% drop from recent highs.",
    "The 'Rule of 72' helps you estimate doubling your money.",
    "Dividends are profits paid out to shareholders.",
    "Dollar-cost averaging reduces the impact of volatility."
  ];

  const academyQuestions = [
    { q: "What is 'Inflation'?", options: ["Prices going up", "Prices going down", "Free money"], a: "Prices going up", explain: "Inflation erodes the value of cash over time." },
    { q: "A 'Bull Market' means prices are...", options: ["Falling", "Rising", "Staying same"], a: "Rising", explain: "Bulls push the market up!" },
    { q: "What is a 'Dividend'?", options: ["A company loan", "A share of profit", "A tax penalty"], a: "A share of profit", explain: "Companies pay dividends to reward shareholders." }
  ];

  const newsEvents = [
    { msg: "TECH BOOM: ADITYA  INDUSTRIES SOARS!", target: "ADITYA", impact: 0.3, type: "good" },
    { msg: "CYBER ATTACK ON AKASH Ltd!", target: "AKASH", impact: -0.4, type: "bad" },
    { msg: "MARKET CRASH: EVERYTHING DROPS!", target: "all", impact: -0.3, type: "bad" }
  ];

  // --- LOGIC & PERSISTENCE ---
  const updateLeaderboard = () => {
    const users = Object.keys(localStorage)
      .filter(key => key.startsWith('shark_user_'))
      .map(key => ({ name: key.replace('shark_user_', '').toUpperCase(), balance: JSON.parse(localStorage.getItem(key)!).balance }))
      .sort((a, b) => b.balance - a.balance);
    setLeaderboardData(users);
  };

  const getRank = (bal: number) => {
    if (bal >= 1000000) return { title: "APEX PREDATOR", color: "text-red-500" };
    if (bal >= 100000) return { title: "MARKET SHARK", color: "text-blue-400" };
    return { title: "STOCK MARKET", color: "text-slate-500" };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    const saved = localStorage.getItem(`shark_user_${userName.toLowerCase()}`);
    if (saved) {
      const p = JSON.parse(saved);
      setBalance(p.balance);
      Object.keys(p.stocks).forEach(k => { if(stocks[k as keyof typeof stocks]) stocks[k as keyof typeof stocks].shares = p.stocks[k].shares; });
    }
    setIsLoggedIn(true);
    updateLeaderboard();
  };

  useEffect(() => {
    if (isLoggedIn) {
      const data = { balance, theme, stocks: Object.fromEntries(Object.entries(stocks).map(([k, v]) => [k, { shares: v.shares }])) };
      localStorage.setItem(`shark_user_${userName.toLowerCase()}`, JSON.stringify(data));
    }
  }, [balance, theme, stocks, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const loop = setInterval(() => {
      setStocks(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const s = next[k as keyof typeof stocks];
          s.price = Math.max(1, s.price + (Math.floor(Math.random() * (s.volatility * 2)) - s.volatility));
          s.history = [...s.history.slice(1), { p: s.price }];
        });
        return next;
      });
      const last = localStorage.getItem(`bonus_${userName.toLowerCase()}`);
      const diff = 18000000 - (Date.now() - parseInt(last || "0"));
      if (diff <= 0) { setCanCollect(true); setTimeLeft("READY"); }
      else { setTimeLeft(`${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`); setCanCollect(false); }
    }, 2500);
    return () => clearInterval(loop);
  }, [isLoggedIn, userName]);

  // --- LIVE BACKGROUND COMPONENT ---
  const LiveBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020408]">
      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"
      />
      <motion.div 
        animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[120px] rounded-full"
      />
      {/* Moving Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white relative">
      <LiveBackground />
      <form onSubmit={handleLogin} className="bg-[#0f1218]/80 backdrop-blur-2xl p-10 rounded-[40px] border border-white/10 w-full max-w-sm shadow-2xl">
        <Crown size={48} className="mx-auto mb-4 text-blue-500" />
        <h1   className="text-2xl font-black mb-8 italic uppercase tracking-tighter">  FINLAB SHAAK  </h1>
        <input className="w-full bg-white/5 p-4 rounded-2xl mb-4 border border-white/10 outline-none" placeholder="Username..." value={userName} onChange={(e) => setUserName(e.target.value)} />
        <button className="w-full bg-blue-600 py-4 rounded-2xl font-black hover:bg-blue-500 transition-colors"> LOGIN INTO FINLAB SHAAK </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen p-4 text-white font-sans relative">
      <LiveBackground />
      
      <div className="max-w-6xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><UserCircle className="text-blue-400"/></div>
            <span className="text-white font-black text-xs uppercase tracking-widest">{userName}</span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => { updateLeaderboard(); setShowLeaderboard(true); }} className="hover:scale-110 transition-transform"><Trophy size={20} className="text-yellow-500"/></button>
            <div className="h-4 w-[1px] bg-white/10" />
            <button onClick={() => setIsLoggedIn(false)} className="text-[10px] font-black opacity-40 hover:opacity-100 uppercase">Exit</button>
          </div>
        </div>

        {/* DUAL STREAM TICKERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center gap-3">
            <Newspaper size={16} className="text-blue-400"/>
            <p className="text-[10px] font-black uppercase truncate tracking-tighter"><span className="text-blue-500/50">NEWS //</span> {news.msg}</p>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center gap-3">
            <Activity size={16} className="text-emerald-500"/>
            <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight italic">"{financeFacts[factIndex]}"</p>
          </div>
        </div>

        {/* MAIN HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10">
            <p className="text-[10px] opacity-40 font-black uppercase mb-1">Available Money</p>
            <h2 className="text-3xl font-mono font-black text-white tracking-tighter">₹{balance.toLocaleString()}</h2>
          </div>
          
          <button onClick={() => { if(canCollect) { setBalance(b => b + 2500); localStorage.setItem(`bonus_${userName.toLowerCase()}`, Date.now().toString()); }}} 
            className={`p-6 rounded-[32px] border transition-all flex justify-between items-center group ${canCollect ? 'bg-white text-black' : 'bg-white/5 border-white/10 opacity-50'}`}>
            <div className="flex items-center gap-3">
              <Clock size={20} className={canCollect ? 'animate-spin' : ''}/>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase opacity-60">Daily Bonus</p>
                <p className="text-lg font-black">{timeLeft}</p>
              </div>
            </div>
            {canCollect && <Zap className="group-hover:scale-125 transition-transform" />}
          </button>

          <button onClick={() => setShowAcademy(true)} className="p-6 rounded-[32px] bg-blue-600/90 hover:bg-blue-500 backdrop-blur-lg text-white flex justify-between items-center transition-all shadow-xl shadow-blue-900/20">
            <div className="flex items-center gap-3"><BookOpen size={20}/><span className="font-black tracking-widest uppercase text-sm">Academy</span></div>
            <ArrowUpRight/>
          </button>
        </div>

        {/* TRADING INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pb-10">
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {Object.entries(stocks).map(([sym, data]) => (
              <button key={sym} onClick={() => setActiveStock(sym)} className={`w-full p-4 rounded-2xl border transition-all ${activeStock === sym ? 'bg-white/10 border-white/30 shadow-lg' : 'bg-black/20 border-white/5 opacity-60 hover:opacity-100'}`}>
                <div className="flex justify-between font-black text-xs"><span>{sym}</span><span className="font-mono">₹{data.price}</span></div>
                <div className="text-[9px] mt-2 text-left opacity-40 uppercase font-black">{data.shares} Units Held</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white/5 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-white/40 font-black uppercase text-[10px] tracking-widest mb-1">{stocks[activeStock as keyof typeof stocks].name}</h3>
                  <p className="text-5xl font-mono font-black text-white tracking-tighter">₹{stocks[activeStock as keyof typeof stocks].price}</p>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-black px-2 py-1 rounded-md mb-2 inline-block ${getRank(balance).color} bg-black/40 border border-white/5`}>
                    {getRank(balance).title}
                  </div>
                </div>
             </div>
             
             <div className="h-64 mb-8">
               <ResponsiveContainer>
                 <LineChart data={stocks[activeStock as keyof typeof stocks].history}>
                   <Line type="monotone" dataKey="p" stroke={stocks[activeStock as keyof typeof stocks].color} strokeWidth={4} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { if(balance >= stocks[activeStock as keyof typeof stocks].price) { setBalance(b => b - stocks[activeStock as keyof typeof stocks].price); setStocks({...stocks, [activeStock]: {...stocks[activeStock as keyof typeof stocks], shares: stocks[activeStock as keyof typeof stocks].shares + 1}}); }}} className="py-6 rounded-3xl bg-emerald-500 text-black font-black text-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-900/20">BUY</button>
                <button onClick={() => { if(stocks[activeStock as keyof typeof stocks].shares > 0) { setBalance(b => b + stocks[activeStock as keyof typeof stocks].price); setStocks({...stocks, [activeStock]: {...stocks[activeStock as keyof typeof stocks], shares: stocks[activeStock as keyof typeof stocks].shares - 1}}); }}} className="py-6 rounded-3xl bg-red-500 text-white font-black text-xl hover:bg-red-400 active:scale-95 transition-all shadow-lg shadow-red-900/20">SELL</button>
             </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1218] p-8 rounded-[40px] w-full max-w-md border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-8"><span className="text-yellow-500 font-black italic uppercase text-sm tracking-widest">Global Rankings</span><button onClick={() => setShowLeaderboard(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={18}/></button></div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {leaderboardData.map((user, i) => (
                  <div key={user.name} className={`flex justify-between p-4 rounded-2xl border ${user.name === userName.toUpperCase() ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-sm">{i+1}. {user.name}</span>
                      <span className={`text-[8px] font-black ${getRank(user.balance).color} tracking-tighter`}>{getRank(user.balance).title}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold self-center">₹{user.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAcademy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1218] p-10 rounded-[40px] w-full max-w-md border border-white/10 shadow-2xl">
              {!feedback ? (
                <>
                  <div className="flex justify-between items-center mb-6"><span className="text-blue-400 font-black italic uppercase text-sm tracking-widest">Knowledge Portal</span><button onClick={() => setShowAcademy(false)}><X/></button></div>
                  <h3 className="text-white font-black text-lg mb-8 leading-tight">{academyQuestions[currentQ].q}</h3>
                  <div className="space-y-3">
                    {academyQuestions[currentQ].options.map(opt => (
                      <button key={opt} onClick={() => {
                        if (opt === academyQuestions[currentQ].a) { 
                          setFeedback({isCorrect: true, msg: "Capital Gained! Knowledge is power."}); 
                          setTimeout(() => { if (currentQ < 2) { setCurrentQ(currentQ+1); setFeedback(null); } else { setBalance(b => b + 5000); setShowAcademy(false); setCurrentQ(0); setFeedback(null); }}, 1500); 
                        } else { setFeedback({isCorrect: false, msg: `Incorrect. ${academyQuestions[currentQ].explain}`}); }
                      }} className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 text-left font-bold hover:bg-white/10 transition-colors">{opt}</button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <h3 className={`text-3xl font-black mb-4 ${feedback.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{feedback.isCorrect ? "MISSION SUCCESS" : "MISSION FAILED"}</h3>
                  <p className="text-slate-400 text-sm mb-10 font-bold">{feedback.msg}</p>
                  {!feedback.isCorrect && <button onClick={() => setFeedback(null)} className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase hover:scale-105 transition-transform">Re-Attempt</button>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}