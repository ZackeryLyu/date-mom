import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Settings, CalendarHeart, Share2, Flame, Smartphone } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';

import { AppState, MomPersonality, CheckInRecord } from './types';
import { APP_STORAGE_KEY, PERSONALITY_DESCRIPTIONS } from './constants';
import { generateMomResponse } from './services/geminiService';
import { MomFeedback } from './components/MomFeedback';
import { StatsChart } from './components/StatsChart';
import { HistoryList } from './components/HistoryList';
import { ShareModal } from './components/ShareModal';

const INITIAL_STATE: AppState = {
  streak: 0,
  lastCheckInDate: null,
  history: [],
  personality: MomPersonality.NAGGING,
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
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
           // Only show if it was today, otherwise clear it to encourage new checkin
           if (isSameDay(new Date(lastRec.timestamp), new Date())) {
               setCurrentResponse(lastRec.momResponse);
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

  const handleCheckIn = async () => {
    if (hasCheckedInToday()) {
      toast("今天已经约过啦！要注意身体哦。", { icon: '🍵' });
      return;
    }

    setIsCheckInLoading(true);
    setCurrentResponse(""); // Clear previous while loading

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

    // 2. Get AI Response
    try {
        const aiResponse = await generateMomResponse(state.personality, newStreak);
        
        const newRecord: CheckInRecord = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            dateStr: todayStr,
            momResponse: aiResponse,
            mood: 'happy'
        };

        setState(prev => ({
            ...prev,
            streak: newStreak,
            lastCheckInDate: todayStr,
            history: [...prev.history, newRecord]
        }));
        
        setCurrentResponse(aiResponse);
        
        // Success effects
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#f472b6', '#fbcfe8']
        });
        toast.success("打卡成功！妈妈收到了！");
        
        // Optional: Open share modal after successful check-in automatically
        setTimeout(() => setShowShareModal(true), 1500);

    } catch (error) {
        toast.error("网络开小差了，请重试");
    } finally {
        setIsCheckInLoading(false);
    }
  };

  const togglePersonality = (p: MomPersonality) => {
      setState(prev => ({ ...prev, personality: p }));
      toast.success(`妈妈性格已切换为：${p}`);
  };

  const getLatestResponseForShare = () => {
    if (currentResponse) return currentResponse;
    if (state.history.length > 0) {
        return state.history[state.history.length - 1].momResponse;
    }
    return "快去约会，妈妈头发都白了！";
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <Toaster position="top-center" />
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
            streak={state.streak} 
            momResponse={getLatestResponseForShare()} 
            onClose={() => setShowShareModal(false)} 
        />
      )}
      
      {/* Header */}
      <header className="bg-pink-600 text-white p-4 pt-8 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-2">
            <Heart className="fill-current w-6 h-6 animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider">约了，妈</h1>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-pink-700 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto scroll-smooth">
        
        {/* Settings Modal/Panel */}
        {showSettings && (
            <div className="mb-6 bg-white rounded-xl p-4 shadow-lg border border-pink-200 animate-in slide-in-from-top-4 fade-in duration-300">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    设置妈妈的性格
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.values(MomPersonality).map((p) => (
                        <button
                            key={p}
                            onClick={() => togglePersonality(p)}
                            className={`p-2 text-sm rounded-lg border transition-all ${
                                state.personality === p 
                                ? 'bg-pink-100 border-pink-500 text-pink-700 font-bold' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                    {PERSONALITY_DESCRIPTIONS[state.personality]}
                </p>

                {/* Install Guide */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <h4 className="font-bold mb-2 flex items-center">
                        <Smartphone className="w-4 h-4 mr-1" />
                        如何安装到手机桌面？
                    </h4>
                    <div className="space-y-2 text-xs opacity-90">
                        <p>1. 在 <strong>Safari</strong> 浏览器中打开本页面</p>
                        <p>2. 点击底部中间的 <strong>分享按钮</strong> <Share2 className="w-3 h-3 inline" /></p>
                        <p>3. 向下滑动，选择 <strong>"添加到主屏幕"</strong></p>
                        <p className="text-blue-600 mt-1 opacity-100 font-medium">✨ 这样就可以像 App 一样全屏使用啦！</p>
                    </div>
                </div>
            </div>
        )}

        {/* Tab Content */}
        {activeTab === 'home' ? (
            <div className="flex flex-col items-center space-y-6">
                
                {/* Streak Card */}
                <div className="w-full bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Flame className="w-24 h-24" />
                    </div>
                    <p className="text-pink-100 font-medium mb-1">连续约会打卡</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-5xl font-extrabold">{state.streak}</span>
                        <span className="text-xl">天</span>
                    </div>
                    <p className="text-xs mt-2 text-pink-100 opacity-80">
                        {state.streak > 3 ? "真的是情场高手！" : "再接再厉，不要让妈妈失望！"}
                    </p>
                </div>

                {/* Main Action Button */}
                <div className="relative group">
                    <div className={`absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${hasCheckedInToday() ? 'hidden' : ''}`}></div>
                    <button 
                        onClick={handleCheckIn}
                        disabled={isCheckInLoading || hasCheckedInToday()}
                        className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-xl border-8 transition-all transform active:scale-95 ${
                            hasCheckedInToday() 
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border-pink-100 hover:border-pink-300 text-pink-600'
                        }`}
                    >
                        {isCheckInLoading ? (
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                        ) : (
                            <>
                                <Heart className={`w-16 h-16 mb-2 ${hasCheckedInToday() ? 'fill-gray-300' : 'fill-pink-500 animate-bounce'}`} />
                                <span className="text-lg font-bold">
                                    {hasCheckedInToday() ? "今日已约" : "妈，我约了"}
                                </span>
                                {!hasCheckedInToday() && <span className="text-xs text-pink-400 mt-1">点击打卡</span>}
                            </>
                        )}
                    </button>
                </div>

                {/* AI Mom Response */}
                {(currentResponse || isCheckInLoading) && (
                    <MomFeedback response={currentResponse} isLoading={isCheckInLoading} />
                )}

                 {/* Stats Chart */}
                 <StatsChart history={state.history} />

            </div>
        ) : (
            <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">约会光荣榜</h2>
                <HistoryList history={state.history} />
            </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center p-2 z-20 pb-safe">
        <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 rounded-xl w-20 transition-colors ${activeTab === 'home' ? 'text-pink-600 bg-pink-50' : 'text-gray-400'}`}
        >
            <CalendarHeart className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">今天</span>
        </button>
        
        <button 
             onClick={() => setShowShareModal(true)}
             className="absolute -top-6 bg-pink-600 text-white p-4 rounded-full shadow-lg border-4 border-pink-50 hover:bg-pink-700 transition-transform hover:scale-105 active:scale-95 group"
        >
             <Share2 className="w-6 h-6 group-hover:animate-wiggle" />
        </button>

        <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center p-2 rounded-xl w-20 transition-colors ${activeTab === 'history' ? 'text-pink-600 bg-pink-50' : 'text-gray-400'}`}
        >
            <Heart className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">记录</span>
        </button>
      </nav>
      
      {/* Safe area padding for bottom nav on mobile */}
      <div className="h-6 w-full bg-white md:hidden"></div>
    </div>
  );
}