import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
      <div className="relative w-80 h-64 flex items-center justify-center overflow-visible">
        
        {/* Stars - Deep Background */}
        <div className="absolute inset-0 z-0 opacity-60">
            <div className="absolute top-[10%] left-[20%] w-0.5 h-0.5 bg-white rounded-full animate-[twinkle_3s_infinite]"></div>
            <div className="absolute top-[30%] right-[30%] w-1 h-1 bg-zinc-300 rounded-full animate-[twinkle_5s_infinite_1s]"></div>
            <div className="absolute bottom-[40%] left-[10%] w-1 h-1 bg-zinc-500 rounded-full animate-[twinkle_4s_infinite_0.5s]"></div>
            <div className="absolute top-[15%] right-[10%] w-0.5 h-0.5 bg-white/40 rounded-full animate-[twinkle_6s_infinite_2s]"></div>
        </div>

        {/* Moon - Right Side, Pointing Top-Right (↗️) */}
        <div className="absolute top-[5%] right-[10%] z-0 animate-[float_6s_ease-in-out_infinite]">
             <svg 
                width="120" 
                height="120" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                overflow="visible" /* Fix for cropping issue */
             >
                {/* 
                   Standard Crescent (C-shape facing Right),
                   Rotated -45deg to point Top-Right.
                   Centered roughly at 50,50.
                */}
                <path 
                    d="M 65 25 A 35 35 0 1 0 65 75 A 28 28 0 1 1 65 25 Z"
                    fill="url(#moon_gradient)"
                    transform="rotate(-45, 65, 50)" /* Rotate around center of the shape */
                />
                <defs>
                    <linearGradient id="moon_gradient" x1="30" y1="30" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#e4e4e7" /> {/* zinc-200 */}
                        <stop offset="100%" stopColor="#71717a" /> {/* zinc-500 */}
                    </linearGradient>
                </defs>
            </svg>
        </div>

        {/* Cloud - Left Side */}
        <div className="absolute bottom-[25%] left-[5%] z-10 animate-[drift_8s_ease-in-out_infinite]">
            <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl" overflow="visible">
                {/* Dark Body of Cloud */}
                <path 
                    d="M45 70C45 81.0457 53.9543 90 65 90H125C138.807 90 150 78.8071 150 65C150 51.1929 138.807 40 125 40C124.3 40 123.6 40.05 122.9 40.15C119.5 23.5 104.5 11 87 11C71 11 57 21 52 35C50 34.3 48 34 46 34C35 34 26 43 26 54C26 54.5 26.05 55 26.1 55.5C17.5 57 11 64.5 11 73.5C11 82.5 18 90 27 90H45V70Z" 
                    className="fill-zinc-800"
                />
                
                {/* Rim Light */}
                <path 
                    d="M52 35C57 21 71 11 87 11C104.5 11 119.5 23.5 122.9 40.15C123.6 40.05 124.3 40 125 40C138.807 40 150 51.1929 150 65" 
                    stroke="white" 
                    strokeOpacity="0.15" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
            
            {/* Soft volumetric glow */}
            <div className="absolute top-4 left-10 right-8 bottom-6 bg-zinc-700/20 blur-xl rounded-full pointer-events-none"></div>
        </div>

      </div>
      
      <div className="flex flex-col items-center gap-3 mt-4">
        <p className="text-zinc-500 font-medium text-xs tracking-[0.5em] uppercase animate-pulse">
          Dreaming
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes drift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};