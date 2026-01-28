import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Heart, CalendarHeart, Share2, Flame, Send } from 'lucide-react';
import { format, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';
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

  // Sync Body Background & Theme Color to prevent white bars at bottom
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDated) {
      // Dark mode (Indigo/Purple)
      document.body.style.backgroundColor = '#2e1065'; // Matches indigo-950 approx
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#2e1065');
    } else {
      // Light mode (Pink-50)
      document.body.style.backgroundColor = '#fdf2f8';
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#ec4899');
    }
  }, [isDated]);

  const handleCheckIn = async () => {
    if (isDated) {
      toast("今天已经汇报过啦！专心约会吧。", { icon: '🌹' });
      return;
    }

    setIsCheckInLoading(true);
    setCurrentMessage(""); 

    // 1. Calculate streak (Fixed Logic)
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    let newStreak = 1; // Default to 1 (new start)

    if (state.lastCheckInDate) {
        const lastDate = parseISO(state.lastCheckInDate);
        const daysDiff = differenceInCalendarDays(today, lastDate);
        
        if (daysDiff === 1) {
            newStreak = state.streak + 1;
        } else if (daysDiff === 0) {
            newStreak = state.streak;
        } else {
            newStreak = 1;
        }
    }

    // 2. Pick Random Script
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
    ? "bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-pink-50" 
    : "bg-pink-50 text-gray-800";

  const headerClass = isDated
    ? "bg-transparent text-pink-200 border-pink-800/30"
    : "bg-white/80 text-pink-600 border-pink-100";

  const streakCardClass = isDated
    ? "bg-white/10 backdrop-blur-md border border-white/20 text-white"
    : "bg-white border border-pink-100 text-gray-800";

  const streakNumberClass = isDated ? "text-pink-300" : "text-pink-500";
  const streakIconBg = isDated ? "bg-pink-500/20" : "bg-pink-100";
  const streakIconColor = isDated ? "text-pink-400" : "text-pink-500";

  // Responsive Button Styles
  // Reduced to 22vh to give more space for header
  const buttonBaseClass = "relative w-[22vh] h-[22vh] min-w-[130px] min-h-[130px] max-w-[190px] max-h-[190px] rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-700 transform active:scale-95 border-[6px]";
  
  const buttonStyleClass = isDated
    ? "bg-black/20 backdrop-blur-xl border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.5)]" 
    : "bg-gradient-to-br from-pink-100 to-rose-50 border-pink-200 shadow-pink-200 hover:border-pink-300";

  const heartIconClass = isDated
    ? "fill-pink-600 text-pink-600 animate-pulse drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]"
    : "fill-white text-pink-300 drop-shadow-md";

  const buttonTextClass = isDated 
    ? "text-pink-200 drop-shadow-md text-2xl" 
    : "text-pink-500 text-2xl";

  const navClass = isDated
    ? "bg-black/40 backdrop-blur-lg border-t border-white/10 text-gray-400"
    : "bg-white/90 backdrop-blur border-t border-pink-100 text-gray-400";
    
  const navActiveColor = isDated ? "text-pink-400" : "text-pink-500";

  return (
    // Fixed inset-0 locks the app to the viewport, preventing body scroll
    <div className={`fixed inset-0 m-auto flex flex-col max-w-md shadow-2xl overflow-hidden transition-colors duration-1000 ${containerClass}`}>
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
      
      {/* Header - Increased Top Padding to pt-16 (64px) for Dynamic Island */}
      <header className={`px-4 pb-2 pt-16 flex justify-center items-center sticky top-0 z-10 shadow-sm transition-colors duration-500 shrink-0 ${headerClass}`}>
        <div className="flex items-center space-x-2">
            <Heart className={`w-5 h-5 ${isDated ? 'fill-pink-600 text-pink-600' : 'fill-pink-500 text-pink-500'}`} />
            <h1 className="text-lg font-bold tracking-wider">约了，妈</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative w-full">
        
        {/* Home Tab: touch-none prevents gestures from scrolling the body */}
        {activeTab === 'home' ? (
            <div className="w-full h-full flex flex-col px-4 pb-2 overflow-hidden touch-none select-none">
                
                {/* 1. Streak Card - Compact */}
                <div className={`shrink-0 w-full rounded-2xl p-2 px-3 shadow-sm relative overflow-hidden flex justify-between items-center transition-colors duration-500 ${streakCardClass}`}>
                    <div>
                        <p className={`text-[10px] font-medium mb-0.5 uppercase tracking-wide ${isDated ? 'text-pink-200/70' : 'text-gray-400'}`}>
                            连续汇报天数
                        </p>
                        <div className="flex items-baseline space-x-1">
                            <span className={`text-4xl font-black ${streakNumberClass}`}>{state.streak}</span>
                            <span className={`text-xs ${isDated ? 'text-pink-200/50' : 'text-gray-400'}`}>天</span>
                        </div>
                    </div>
                    <div className={`p-2 rounded-full ${streakIconBg}`}>
                        <Flame className={`w-5 h-5 ${streakIconColor}`} />
                    </div>
                </div>

                {/* 2. Action Button - Takes flexible space */}
                <div className="flex-1 flex items-center justify-center min-h-0 w-full">
                    <div className="relative group">
                        <button 
                            onClick={handleCheckIn}
                            disabled={isCheckInLoading || isDated}
                            className={`${buttonBaseClass} ${buttonStyleClass}`}
                        >
                            {isCheckInLoading ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current opacity-70"></div>
                            ) : (
                                <>
                                    <Heart className={`w-[40%] h-[40%] mb-2 transition-all duration-500 ${heartIconClass}`} />
                                    <span className={`font-black tracking-widest ${buttonTextClass}`}>
                                        {isDated ? "约了！" : "约会去"}
                                    </span>
                                    <span className={`text-[10px] mt-1 font-medium tracking-wide ${isDated ? "text-pink-300/60" : "text-pink-400/80"}`}>
                                        {isDated ? "任务完成" : "让妈放心"}
                                    </span>
                                </>
                            )}
                        </button>
                        {isDated && (
                            <div className="absolute inset-0 rounded-full bg-pink-500 opacity-20 blur-2xl -z-10 animate-pulse"></div>
                        )}
                    </div>
                </div>

                {/* 3. Bottom Section: Message & Chart */}
                <div className="shrink-0 flex flex-col justify-end gap-1 w-full">
                    {/* Message Bubble - Compact */}
                    <div className="min-h-[3rem] flex items-end justify-center">
                        {(currentMessage || isCheckInLoading) && (
                            <MomFeedback 
                                message={currentMessage} 
                                isLoading={isCheckInLoading} 
                                darkMode={isDated} 
                            />
                        )}
                    </div>

                    {/* Stats Chart - Reduced height to 16vh and tighter constraints */}
                    <div className={`w-full h-[16vh] min-h-[90px] max-h-[160px] p-2 rounded-2xl ${isDated ? 'bg-white/5 border border-white/10' : 'bg-white'}`}>
                        <StatsChart history={state.history} darkMode={isDated} />
                    </div>
                </div>

            </div>
        ) : (
            /* History Tab: touch-pan-y allows scrolling here */
            <div className="w-full h-full overflow-y-auto px-4 py-2 pb-20 animate-in fade-in duration-300 touch-pan-y">
                <h2 className={`text-lg font-bold mb-3 px-2 flex items-center ${isDated ? 'text-white' : 'text-gray-800'}`}>
                    <Send className={`w-4 h-4 mr-2 ${isDated ? 'text-pink-400' : 'text-pink-500'}`} />
                    汇报记录
                </h2>
                <HistoryList history={state.history} darkMode={isDated} />
            </div>
        )}
      </main>

      {/* Footer Container - Wraps Nav and Floating Button */}
      <div className="shrink-0 z-20 w-full max-w-md relative">
        
        {/* Floating Share Button - Set container to pointer-events-none to prevent blocking, button to auto */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-50 pointer-events-none w-auto flex justify-center">
             <button 
                 onClick={() => setShowShareModal(true)}
                 className={`pointer-events-auto p-3 rounded-full shadow-lg border-4 hover:scale-105 transition-transform ${isDated ? 'bg-pink-600 border-indigo-900 text-white' : 'bg-gray-900 text-white border-pink-50'}`}
            >
                 <Share2 className="w-5 h-5" />
            </button>
        </div>

        {/* Navigation Bar - Reduced side padding (px-6) to move buttons outward, used relative z-20 for buttons */}
        <nav className={`${navClass} relative w-full flex justify-between px-6 items-center pt-2 pb-safe z-10 transition-colors duration-500`}>
            <button 
                onClick={() => setActiveTab('home')}
                className={`relative z-20 flex flex-col items-center p-2 rounded-xl w-16 transition-colors ${activeTab === 'home' ? navActiveColor : 'text-gray-400'}`}
            >
                <CalendarHeart className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium">打卡</span>
            </button>
            
            {/* Middle Spacer */}
            <div className="w-16 h-1"></div>
            
            <button 
                onClick={() => setActiveTab('history')}
                className={`relative z-20 flex flex-col items-center p-2 rounded-xl w-16 transition-colors ${activeTab === 'history' ? navActiveColor : 'text-gray-400'}`}
            >
                <Send className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium">记录</span>
            </button>
        </nav>
      </div>

    </div>
  );
}