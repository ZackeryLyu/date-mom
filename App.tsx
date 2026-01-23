
import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Heart, CalendarHeart, Share2, Flame, Send, Moon, Sun } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';

import { AppState, CheckInRecord } from './types';
import { APP_STORAGE_KEY, REPORT_SCRIPTS } from './constants';
import { MomFeedback } from './components/MomFeedback';
import { StatsChart } from './components/StatsChart';
import { HistoryList } from './components/HistoryList';
import { ShareModal } from './components/ShareModal';

const INITIAL_STATE: AppState = {
  streak: 0,
  lastCheckInDate: null,
  history: [],
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'history'>('home');

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed }));
        // If there's history, set the latest response to display
        if (parsed.history && parsed.history.length > 0) {
           const lastRec = parsed.history[parsed.history.length - 1];
           // Only show if it was today
           if (isSameDay(new Date(lastRec.timestamp), new Date())) {
               setCurrentMessage(lastRec.reportMessage);
           }
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const hasCheckedInToday = useCallback(() => {
    if (!state.lastCheckInDate) return false;
    return isSameDay(new Date(state.lastCheckInDate), new Date());
  }, [state.lastCheckInDate]);

  const isDated = hasCheckedInToday();

  const handleCheckIn = async () => {
    if (isDated) {
      toast("今天已经汇报过啦！专心约会吧。", { icon: '🌹' });
      return;
    }

    setIsCheckInLoading(true);
    setCurrentMessage(""); 

    // 1. Calculate streak
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    let newStreak = state.streak;
    if (state.lastCheckInDate) {
        const lastDate = new Date(state.lastCheckInDate);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 1; // Streak broken
        }
    } else {
        newStreak = 1;
    }

    // 2. Pick Random Script
    // 模拟网络延迟，增加仪式感
    setTimeout(() => {
        const randomMsg = REPORT_SCRIPTS[Math.floor(Math.random() * REPORT_SCRIPTS.length)];
        
        const newRecord: CheckInRecord = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            dateStr: todayStr,
            reportMessage: randomMsg,
            mood: 'happy'
        };

        setState(prev => ({
            ...prev,
            streak: newStreak,
            lastCheckInDate: todayStr,
            history: [...prev.history, newRecord]
        }));
        
        setCurrentMessage(randomMsg);
        setIsCheckInLoading(false);
        
        // Success effects
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#8b5cf6', '#f43f5e']
        });
        toast.success("汇报成功！妈妈已收到！");
        
        // Optional: Open share modal
        setTimeout(() => setShowShareModal(true), 1500);
    }, 800);
  };

  const getLatestMessageForShare = () => {
    if (currentMessage) return currentMessage;
    if (state.history.length > 0) {
        return state.history[state.history.length - 1].reportMessage;
    }
    return "妈，我今天去约会了！";
  };

  // --- Dynamic Styling based on Check-In Status ---
  const containerClass = isDated 
    ? "bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-pink-50" // Ambiguous (Dark/Romantic)
    : "bg-pink-50 text-gray-800"; // Original (Pink/Rose)

  const headerClass = isDated
    ? "bg-transparent text-pink-200 border-pink-800/30"
    : "bg-white/80 text-pink-600 border-pink-100";

  const streakCardClass = isDated
    ? "bg-white/10 backdrop-blur-md border border-white/20 text-white"
    : "bg-white border border-pink-100 text-gray-800";

  const streakNumberClass = isDated ? "text-pink-300" : "text-pink-500";
  const streakIconBg = isDated ? "bg-pink-500/20" : "bg-pink-100";
  const streakIconColor = isDated ? "text-pink-400" : "text-pink-500";

  const buttonBaseClass = "relative w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-700 transform active:scale-95 border-8";
  
  const buttonStyleClass = isDated
    ? "bg-black/20 backdrop-blur-xl border-pink-500/50 shadow-[0_0_40px_rgba(236,72,153,0.6)]" // Ambiguous style
    : "bg-gradient-to-br from-pink-100 to-rose-50 border-pink-200 shadow-pink-200 hover:border-pink-300"; // Original Pink style

  const heartIconClass = isDated
    ? "fill-pink-600 text-pink-600 animate-pulse drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]"
    : "fill-white text-pink-300 drop-shadow-md";

  const buttonTextClass = isDated 
    ? "text-pink-200 drop-shadow-md text-3xl" 
    : "text-pink-500 text-3xl";

  const navClass = isDated
    ? "bg-black/40 backdrop-blur-lg border-t border-white/10 text-gray-400"
    : "bg-white/90 backdrop-blur border-t border-pink-100 text-gray-400";
    
  const navActiveColor = isDated ? "text-pink-400" : "text-pink-500";

  return (
    <div className={`min-h-screen flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-1000 ${containerClass}`}>
      <Toaster position="top-center" toastOptions={{
          style: {
            background: isDated ? '#333' : '#fff',
            color: isDated ? '#fff' : '#333',
          }
      }} />
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
            streak={state.streak} 
            message={getLatestMessageForShare()} 
            onClose={() => setShowShareModal(false)} 
        />
      )}
      
      {/* Header */}
      <header className={`p-4 pt-8 flex justify-center items-center sticky top-0 z-10 shadow-sm transition-colors duration-500 ${headerClass}`}>
        <div className="flex items-center space-x-2">
            <Heart className={`w-6 h-6 ${isDated ? 'fill-pink-600 text-pink-600' : 'fill-pink-500 text-pink-500'}`} />
            <h1 className="text-xl font-bold tracking-wider">约了，妈</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto scroll-smooth">
        
        {/* Tab Content */}
        {activeTab === 'home' ? (
            <div className="flex flex-col items-center space-y-8 mt-4">
                
                {/* Streak Card */}
                <div className={`w-full rounded-3xl p-6 shadow-sm relative overflow-hidden flex justify-between items-center transition-colors duration-500 ${streakCardClass}`}>
                    <div>
                        <p className={`text-xs font-medium mb-1 uppercase tracking-wide ${isDated ? 'text-pink-200/70' : 'text-gray-400'}`}>
                            连续汇报天数
                        </p>
                        <div className="flex items-baseline space-x-1">
                            <span className={`text-5xl font-black ${streakNumberClass}`}>{state.streak}</span>
                            <span className={`text-sm ${isDated ? 'text-pink-200/50' : 'text-gray-400'}`}>天</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-full ${streakIconBg}`}>
                        <Flame className={`w-8 h-8 ${streakIconColor}`} />
                    </div>
                </div>

                {/* Main Action Button */}
                <div className="relative group my-4">
                    <button 
                        onClick={handleCheckIn}
                        disabled={isCheckInLoading || isDated}
                        className={`${buttonBaseClass} ${buttonStyleClass}`}
                    >
                        {isCheckInLoading ? (
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current opacity-70"></div>
                        ) : (
                            <>
                                <Heart className={`w-28 h-28 mb-4 transition-all duration-500 ${heartIconClass}`} />
                                <span className={`font-black tracking-widest ${buttonTextClass}`}>
                                    {isDated ? "约了！妈" : "约会去"}
                                </span>
                                <span className={`text-xs mt-2 font-medium tracking-wide ${isDated ? "text-pink-300/60" : "text-pink-400/80"}`}>
                                    {isDated ? "今日任务已完成" : "点击这里让妈妈放心"}
                                </span>
                            </>
                        )}
                    </button>
                    {/* Glow effect for Ambiguous mode */}
                    {isDated && (
                        <div className="absolute inset-0 rounded-full bg-pink-500 opacity-20 blur-3xl -z-10 animate-pulse"></div>
                    )}
                </div>

                {/* Display the User's Message */}
                {(currentMessage || isCheckInLoading) && (
                    <MomFeedback 
                        message={currentMessage} 
                        isLoading={isCheckInLoading} 
                        darkMode={isDated} 
                    />
                )}

                 {/* Stats Chart */}
                 <div className={`w-full rounded-2xl p-2 ${isDated ? 'bg-white/5 border border-white/10' : 'bg-white'}`}>
                    <StatsChart history={state.history} darkMode={isDated} />
                 </div>

            </div>
        ) : (
            <div className="animate-in fade-in duration-300">
                <h2 className={`text-xl font-bold mb-4 px-2 flex items-center ${isDated ? 'text-white' : 'text-gray-800'}`}>
                    <Send className={`w-5 h-5 mr-2 ${isDated ? 'text-pink-400' : 'text-pink-500'}`} />
                    汇报记录
                </h2>
                <HistoryList history={state.history} darkMode={isDated} />
            </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className={`${navClass} fixed bottom-0 w-full max-w-md flex justify-around items-center p-2 z-20 pb-safe transition-colors duration-500`}>
        <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 rounded-xl w-20 transition-colors ${activeTab === 'home' ? navActiveColor : 'text-gray-400'}`}
        >
            <CalendarHeart className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">打卡</span>
        </button>
        
        <button 
             onClick={() => setShowShareModal(true)}
             className={`absolute -top-6 p-4 rounded-full shadow-lg border-4 hover:scale-105 transition-transform ${isDated ? 'bg-pink-600 border-indigo-900 text-white' : 'bg-gray-900 text-white border-pink-50'}`}
        >
             <Share2 className="w-6 h-6" />
        </button>

        <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center p-2 rounded-xl w-20 transition-colors ${activeTab === 'history' ? navActiveColor : 'text-gray-400'}`}
        >
            <Send className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">记录</span>
        </button>
      </nav>
      
      {/* Safe area padding for bottom nav on mobile */}
      <div className={`h-6 w-full md:hidden ${isDated ? 'bg-black/40' : 'bg-white'}`}></div>
    </div>
  );
}
