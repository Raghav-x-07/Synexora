import React from 'react';

interface AnimatedBookProps {
  isOpen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const AnimatedBook: React.FC<AnimatedBookProps> = ({
  isOpen = false,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: {
      wrapper: 'w-16 h-20',
      perspective: 'perspective-[600px]',
      spineWidth: 'w-2.5',
      pageThickness: 'h-18',
    },
    md: {
      wrapper: 'w-24 h-28',
      perspective: 'perspective-[800px]',
      spineWidth: 'w-3.5',
      pageThickness: 'h-24',
    },
    lg: {
      wrapper: 'w-32 h-36',
      perspective: 'perspective-[1000px]',
      spineWidth: 'w-4',
      pageThickness: 'h-32',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none group flex items-center justify-center ${sizeClasses.wrapper} ${className}`}
      style={{ perspective: '900px' }}
      title="Click or interact to open/close book"
    >
      {/* Soft Ambient Book Glow */}
      <div
        className={`absolute -inset-2 bg-emerald-400/20 rounded-full blur-xl transition-opacity duration-700 pointer-events-none ${
          isOpen ? 'opacity-90 scale-110' : 'opacity-30 group-hover:opacity-60'
        }`}
      />

      {/* 3D Book Container */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isOpen
            ? 'rotateY(-15deg) rotateX(10deg)'
            : 'rotateY(-5deg) rotateX(5deg)',
        }}
      >
        {/* Back Cover */}
        <div
          className="absolute inset-0 bg-slate-900 rounded-r-md rounded-l-xs shadow-apple-lg border-r border-slate-700"
          style={{
            transform: 'translateZ(-4px)',
          }}
        />

        {/* Stacked Pages Block (Depth) */}
        <div
          className="absolute top-1 bottom-1 right-0.5 bg-gradient-to-r from-amber-50 via-slate-100 to-amber-100 rounded-r-sm border-r border-slate-300"
          style={{
            width: '88%',
            transform: 'translateZ(-1px)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)',
          }}
        >
          {/* Subtle page lines */}
          <div className="w-full h-full flex flex-col justify-around py-2 px-1.5 opacity-20">
            <div className="h-0.5 bg-slate-400 rounded-full" />
            <div className="h-0.5 bg-slate-400 rounded-full w-4/5" />
            <div className="h-0.5 bg-slate-400 rounded-full w-3/4" />
          </div>
        </div>

        {/* Inside Right Page (Visible when open) */}
        <div
          className={`absolute top-0.5 bottom-0.5 right-0.5 bg-white rounded-r-sm p-2 transition-all duration-700 flex flex-col justify-between overflow-hidden border-l border-slate-200 ${
            isOpen ? 'opacity-100' : 'opacity-80'
          }`}
          style={{
            width: '88%',
            transform: 'translateZ(1px)',
            boxShadow: 'inset 4px 0 8px -2px rgba(0,0,0,0.08)',
          }}
        >
          <div className="space-y-1.5 opacity-70">
            <div className="h-1 bg-emerald-500 rounded-full w-2/3" />
            <div className="h-0.5 bg-slate-300 rounded-full w-full" />
            <div className="h-0.5 bg-slate-300 rounded-full w-5/6" />
            <div className="h-0.5 bg-slate-300 rounded-full w-4/6" />
          </div>
          <div className="text-[8px] font-bold text-emerald-700 text-right font-mono">
            SYNEXORA
          </div>
        </div>

        {/* Turning Middle Page 1 */}
        <div
          className="absolute top-0.5 bottom-0.5 right-0.5 bg-gradient-to-r from-slate-50 to-white rounded-r-sm p-2 transition-transform duration-700 ease-in-out border-l border-slate-200"
          style={{
            width: '88%',
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isOpen ? 'rotateY(-130deg)' : 'rotateY(-4deg)',
            boxShadow: isOpen ? '-4px 4px 10px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {/* Content on turning page */}
          <div className="space-y-1.5 opacity-50">
            <div className="h-0.5 bg-slate-400 rounded-full w-3/4" />
            <div className="h-0.5 bg-slate-400 rounded-full w-full" />
            <div className="h-0.5 bg-slate-300 rounded-full w-2/3" />
          </div>
        </div>

        {/* Front Cover (Opens & Closes on 3D Y-axis) */}
        <div
          className="absolute inset-0 bg-slate-900 rounded-r-md rounded-l-xs flex flex-col justify-between p-2.5 transition-transform duration-700 ease-out border border-slate-800 shadow-apple"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isOpen ? 'rotateY(-165deg)' : 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Gold & Emerald Embossed Brand */}
          <div className="flex items-center justify-between">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-[7px] font-bold tracking-widest text-emerald-300/80 uppercase">
              STUDY
            </span>
          </div>

          <div className="text-center py-1">
            <p className="text-[10px] font-extrabold text-white tracking-wider font-mono leading-tight">
              SYNEXORA
            </p>
            <p className="text-[6px] text-slate-400 font-medium mt-0.5">
              KNOWLEDGE
            </p>
          </div>

          {/* Book Bookmark Ribbon */}
          <div className="flex justify-center">
            <div className="w-1.5 h-3 bg-emerald-500 rounded-b-xs shadow-xs" />
          </div>
        </div>

        {/* Book Spine Accent */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-slate-950 rounded-l-md border-r border-slate-800"
          style={{
            width: '6px',
            transform: 'translateZ(2px)',
          }}
        />
      </div>
    </div>
  );
};
