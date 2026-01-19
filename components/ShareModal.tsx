import React, { useRef, useState } from 'react';
import { X, Download, Copy, Share2, Loader2, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  streak: number;
  momResponse: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ streak, momResponse, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyText = () => {
    const text = `妈，我今天去约会了！\n\n已经在【约了，妈】连续打卡 ${streak} 天。\n虚拟妈妈对我说：“${momResponse}”\n\n为了你的身心健康，我已经很努力了！`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('文字已复制，快去发微信给妈妈吧！');
    }).catch(() => {
      toast.error('复制失败，请手动复制');
    });
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      // Small delay to ensure rendering matches visuals
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Retina quality
        backgroundColor: null,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      
      // Create a temporary link to download
      const link = document.createElement("a");
      link.href = image;
      link.download = `约了妈_打卡${streak}天.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('图片已生成！请发朋友圈显摆一下。', { duration: 3000 });
    } catch (err) {
      console.error(err);
      toast.error('生成图片失败，请直接截屏分享');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
        <div className="p-4 border-b flex justify-between items-center bg-pink-50">
          <h3 className="font-bold text-gray-700 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-pink-600" />
            分享战绩
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-pink-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 bg-gray-100 flex justify-center overflow-y-auto max-h-[60vh] scrollbar-hide">
          {/* Capture Area - This div becomes the image */}
          <div 
            ref={cardRef} 
            className="w-full bg-gradient-to-br from-pink-500 to-rose-400 p-6 rounded-2xl text-white shadow-xl relative flex flex-col items-center text-center select-none"
            style={{ minHeight: '340px' }}
          >
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                 <div className="bg-white/20 p-1.5 rounded-lg">
                    <Heart className="w-4 h-4 text-white fill-current" />
                 </div>
                 <span className="font-bold tracking-wider text-sm">约了，妈</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-mono backdrop-blur-sm tracking-widest">
                {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="my-4 flex-1 flex flex-col justify-center w-full">
              <p className="text-pink-100 text-sm mb-1 opacity-90">为爱奔波</p>
              <div className="relative inline-block">
                <span className="text-7xl font-black drop-shadow-lg tracking-tighter">{streak}</span>
                <span className="text-xl font-medium absolute -right-6 top-2">天</span>
              </div>
              <p className="text-xs text-white/60 mt-2 bg-black/10 self-center px-3 py-1 rounded-full">连续约会打卡</p>
            </div>

            <div className="w-full bg-white text-gray-800 p-4 rounded-xl shadow-lg relative mt-6 text-left">
               <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45"></div>
               <p className="text-xs font-bold text-pink-500 mb-1 flex items-center">
                 <span className="w-2 h-2 bg-pink-500 rounded-full mr-1.5"></span>
                 妈妈发来消息：
               </p>
               <p className="text-sm leading-relaxed text-gray-700 font-medium">
                 {momResponse || "去哪里约会了？快如实招来！"}
               </p>
            </div>

            <div className="mt-6 w-full flex justify-between items-end border-t border-white/20 pt-3">
               <div className="text-left">
                  <p className="text-[10px] text-pink-100 opacity-80">扫码加入相亲大军</p>
                  <p className="text-[9px] text-white/50 mt-0.5">App: 约了，妈</p>
               </div>
               <div className="w-10 h-10 bg-white rounded-lg p-0.5 opacity-90">
                  <div className="w-full h-full bg-gray-900 rounded-md"></div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border-t grid grid-cols-2 gap-4">
          <button 
            onClick={handleCopyText}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100"
          >
            <Copy className="w-6 h-6 mb-1" />
            <span className="text-xs">复制文字给妈</span>
          </button>
          <button 
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-md shadow-pink-200"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 mb-1 animate-spin" /> : <Download className="w-6 h-6 mb-1" />}
            <span className="text-xs">保存图片发票圈</span>
          </button>
        </div>
      </div>
    </div>
  );
};