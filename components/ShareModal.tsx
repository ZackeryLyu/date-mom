
import React, { useRef, useState } from 'react';
import { X, Download, Copy, Share2, Loader2, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  streak: number;
  message: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ streak, message, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyText = () => {
    const text = `妈，我今天去约会了！\n\n已经在【约了，妈】连续打卡 ${streak} 天。\n我对妈妈汇报说：“${message}”`;
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
      
      toast.success('图片已生成！', { duration: 3000 });
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
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-pink-600" />
            分享给妈妈
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 bg-gray-100 flex justify-center overflow-y-auto max-h-[60vh] scrollbar-hide">
          {/* Capture Area */}
          <div 
            ref={cardRef} 
            className="w-full bg-white p-6 rounded-2xl text-gray-800 shadow-xl relative flex flex-col items-center text-center select-none border border-gray-100"
            style={{ minHeight: '340px' }}
          >
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                 <div className="bg-pink-500 p-1.5 rounded-lg">
                    <Heart className="w-4 h-4 text-white fill-current" />
                 </div>
                 <span className="font-bold tracking-wider text-sm text-pink-600">约了，妈</span>
              </div>
              <div className="text-gray-400 text-[10px] font-mono">
                {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="my-2 flex-1 flex flex-col justify-center w-full">
               <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                    <Heart className="w-12 h-12 text-red-500 fill-current" />
               </div>
              <p className="text-gray-500 text-sm mb-1">已连续汇报</p>
              <div className="relative inline-block">
                <span className="text-6xl font-black text-gray-900 tracking-tighter">{streak}</span>
                <span className="text-lg font-medium absolute -right-6 top-4 text-gray-400">天</span>
              </div>
            </div>

            <div className="w-full bg-green-50 text-gray-800 p-4 rounded-xl relative mt-6 text-left border border-green-100">
               <p className="text-xs font-bold text-green-600 mb-1">
                 我给妈妈发消息：
               </p>
               <p className="text-sm leading-relaxed text-gray-700">
                 {message}
               </p>
            </div>

            <div className="mt-6 w-full flex justify-center">
                  <p className="text-[10px] text-gray-300">App: 约了，妈</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border-t grid grid-cols-2 gap-4">
          <button 
            onClick={handleCopyText}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100"
          >
            <Copy className="w-6 h-6 mb-1" />
            <span className="text-xs">复制文字</span>
          </button>
          <button 
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-900 text-white font-medium hover:bg-black transition-all"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 mb-1 animate-spin" /> : <Download className="w-6 h-6 mb-1" />}
            <span className="text-xs">保存图片</span>
          </button>
        </div>
      </div>
    </div>
  );
};
