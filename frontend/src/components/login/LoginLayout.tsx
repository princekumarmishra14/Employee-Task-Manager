"use client";

import React from "react";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="desktop-no-scroll min-h-screen lg:h-screen w-full relative overflow-x-hidden flex flex-col justify-between bg-[#F5F7FB] dark:bg-[#060A17] text-text-primary dark:text-white font-poppins transition-colors duration-300">
      {/* ── Background Mesh Grid & Ambient Orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Dynamic mesh gradient */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-90 dark:opacity-85 transition-opacity duration-300" />

        {/* Noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.035]" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Dot grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" 
          style={{
            backgroundImage: "radial-gradient(rgba(148,163,184,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* Ambient floating blurred orbs */}
        <div className="absolute top-[8%] left-[4%] w-80 h-80 rounded-full bg-slate-500/5 dark:bg-slate-500/10 blur-[90px] animate-[floatOrb_20s_ease-in-out_infinite]" />
        <div className="absolute top-[35%] right-[8%] w-[480px] h-[480px] rounded-full bg-slate-400/5 dark:bg-slate-700/8 blur-[110px] animate-[floatOrbSlow_25s_ease-in-out_infinite]" />
        <div className="absolute bottom-[8%] left-[18%] w-[400px] h-[400px] rounded-full bg-slate-300/5 dark:bg-slate-800/8 blur-[100px] animate-[floatOrb_18s_ease-in-out_infinite]" />
      </div>

      {/* ── Content layers ── */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between flex-1">
        {children}
      </div>
    </div>
  );
}
