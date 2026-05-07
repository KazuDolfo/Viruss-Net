import React, { useEffect, useState, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setStartY(null);
    setCurrentY(0);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] transition-opacity duration-300 ease-out",
      isOpen ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-0 opacity-0 pointer-events-none"
    )} onClick={onClose}>
      <div 
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${isOpen ? currentY : '100%'})` }}
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-[2.5rem] border-t-2 border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out flex flex-col max-h-[90vh]",
          !startY && "transition-transform"
        )}
      >
        {showHandle && (
          <div className="flex justify-center p-4">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
        )}
        
        {title && (
          <div className="px-6 pb-2">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
              {title}
            </h3>
          </div>
        )}

        <div className="overflow-y-auto p-6 pt-2 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
