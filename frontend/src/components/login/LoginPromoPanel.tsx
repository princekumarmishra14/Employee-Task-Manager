"use client";

import React, { useState, useEffect } from "react";

interface Slide {
  id: number;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

export default function LoginPromoPanel() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 0,
      title: "Task Management",
      description: "Manage your task in an easy and more efficient way with Employee Task Manager...",
      illustration: (
        <svg viewBox="0 0 320 280" className="w-full h-full max-h-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ambient light glow */}
          <circle cx="160" cy="140" r="100" fill="white" fillOpacity="0.04" filter="blur(20px)" />
          
          {/* --- TOP: Hand-drawn Stick Figure & Scroll --- */}
          <g className="translate-y-[-10px]">
            {/* Scroll/List (Drawn first so stick figure overlaps it) */}
            <path d="M220 30 H265 V125 H220 Z" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
            <rect x="224" y="34" width="37" height="87" rx="3" fill="#6C72FD" fillOpacity="0.3" stroke="white" strokeWidth="1.5" />
            <text x="242.5" y="47" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">TODO</text>
            <text x="242.5" y="56" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">LIST</text>
            {/* Checklist Items inside scroll */}
            <rect x="230" y="66" width="6" height="6" rx="1.5" fill="none" stroke="white" strokeWidth="1" />
            <line x1="240" y1="69" x2="256" y2="69" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="230" y="78" width="6" height="6" rx="1.5" fill="none" stroke="white" strokeWidth="1" />
            <line x1="240" y1="81" x2="256" y2="81" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="230" y="90" width="6" height="6" rx="1.5" fill="none" stroke="white" strokeWidth="1" />
            <line x1="240" y1="93" x2="256" y2="93" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="230" y="102" width="6" height="6" rx="1.5" fill="none" stroke="white" strokeWidth="1" />
            <line x1="240" y1="105" x2="254" y2="105" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hand-drawn Stick Figure */}
            {/* Head */}
            <circle cx="185" cy="50" r="13" stroke="white" strokeWidth="2" fill="#7B80FC" />
            {/* Face details */}
            <circle cx="181" cy="48" r="1.5" fill="white" />
            <circle cx="189" cy="48" r="1.5" fill="white" />
            <path d="M181 55 Q185 58 189 55" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Spine */}
            <line x1="185" y1="63" x2="185" y2="105" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Legs */}
            <line x1="185" y1="105" x2="173" y2="135" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="185" y1="105" x2="197" y2="135" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Left Arm (on hip) */}
            <path d="M185 73 L168 83 L182 92" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Arm (holding pen/pointing to list) */}
            <path d="M185 73 L208 65 L226 53" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Floating check badges next to stick figure */}
            <circle cx="145" cy="50" r="8" fill="#4ADE80" />
            <path d="M142 50 L144 52 L148 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="141" cy="98" r="8" fill="#4ADE80" />
            <path d="M138 98 L140 100 L144 96" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="278" cy="42" r="8" fill="#4ADE80" />
            <path d="M275 42 L277 44 L281 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* --- BOTTOM: Main Vector Clipboard & Human --- */}
          <g className="translate-y-[20px]">
            {/* Large modern clipboard */}
            <rect x="110" y="105" width="90" height="110" rx="12" fill="white" stroke="white" strokeWidth="2" />
            
            {/* Clipboard header clamp */}
            <path d="M138 105 V100 H172 V105 Z" fill="#E2E8F0" />
            <circle cx="155" cy="98" r="4" fill="#CBD5E1" />
            
            {/* Clipboard lines and check circles */}
            {/* Item 1 */}
            <circle cx="128" cy="128" r="7" fill="#E2FDF0" stroke="#4ADE80" strokeWidth="1.5" />
            <path d="M125.5 128 L127 129.5 L130.5 126" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="142" y="125" width="44" height="6" rx="3" fill="#E2E8F0" />
            {/* Item 2 */}
            <circle cx="128" cy="148" r="7" fill="#E2FDF0" stroke="#4ADE80" strokeWidth="1.5" />
            <path d="M125.5 148 L127 149.5 L130.5 146" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="142" y="145" width="36" height="6" rx="3" fill="#E2E8F0" />
            {/* Item 3 */}
            <circle cx="128" cy="168" r="7" fill="#E2FDF0" stroke="#4ADE80" strokeWidth="1.5" />
            <path d="M125.5 168 L127 169.5 L130.5 166" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="142" y="165" width="48" height="6" rx="3" fill="#E2E8F0" />
            {/* Item 4 */}
            <circle cx="128" cy="188" r="7" fill="#E2FDF0" stroke="#4ADE80" strokeWidth="1.5" />
            <path d="M125.5 188 L127 189.5 L130.5 186" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="142" y="185" width="40" height="6" rx="3" fill="#E2E8F0" />

            {/* Human figure next to clipboard */}
            <g className="translate-x-[20px]">
              {/* Legs */}
              <line x1="205" y1="185" x2="202" y2="215" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              <line x1="213" y1="185" x2="216" y2="215" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="201" cy="216" rx="4" ry="2" fill="#1E293B" />
              <ellipse cx="217" cy="216" rx="4" ry="2" fill="#1E293B" />
              
              {/* Torso/Jacket */}
              <path d="M198 140 H220 L217 185 H201 Z" fill="#FFAE34" />
              <path d="M205 140 L209 185 M213 140 L209 185" stroke="#1E293B" strokeWidth="1.5" />
              <rect x="204" y="142" width="10" height="43" fill="#1E293B" />
              
              {/* Head */}
              <circle cx="209" cy="128" r="7" fill="#FDBA74" />
              <path d="M205 123 Q209 120 213 123" stroke="#1E293B" strokeWidth="2" fill="none" />
              
              {/* Arms */}
              <path d="M198 143 L186 160 L195 165" stroke="#FFAE34" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M220 143 L226 165 L221 170" stroke="#FFAE34" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          </g>

          {/* Floor / shadow under elements */}
          <ellipse cx="160" cy="235" rx="90" ry="6" fill="#1E293B" fillOpacity="0.15" />
        </svg>
      ),
    },
    {
      id: 1,
      title: "Team Collaboration",
      description: "Collaborate with your team in real-time, delegate responsibilities, and sync on progress.",
      illustration: (
        <svg viewBox="0 0 320 280" className="w-full h-full max-h-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="140" r="100" fill="white" fillOpacity="0.04" filter="blur(20px)" />
          
          {/* Main Card Grid representing a Kanban/Task Board */}
          <rect x="50" y="50" width="220" height="150" rx="16" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="2" />
          
          {/* Board Columns */}
          <line x1="123" y1="52" x2="123" y2="198" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="196" y1="52" x2="196" y2="198" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
          
          {/* Column Headers */}
          <rect x="60" y="62" width="50" height="12" rx="3" fill="#FFAE34" fillOpacity="0.8" />
          <text x="85" y="71" fill="white" fontSize="7" fontWeight="black" textAnchor="middle">TODO</text>
          
          <rect x="133" y="62" width="50" height="12" rx="3" fill="#4F46E5" fillOpacity="0.8" />
          <text x="158" y="71" fill="white" fontSize="7" fontWeight="black" textAnchor="middle">DOING</text>
          
          <rect x="206" y="62" width="50" height="12" rx="3" fill="#22C55E" fillOpacity="0.8" />
          <text x="231" y="71" fill="white" fontSize="7" fontWeight="black" textAnchor="middle">DONE</text>

          {/* Floating Task Card 1 (Column 1) */}
          <rect x="60" y="82" width="50" height="30" rx="6" fill="white" />
          <rect x="66" y="90" width="38" height="4" rx="2" fill="#94A3B8" />
          <rect x="66" y="98" width="24" height="4" rx="2" fill="#E2E8F0" />
          <circle cx="98" cy="104" r="5" fill="#4F46E5" />

          {/* Floating Task Card 2 (Column 2 - Active) */}
          <g className="translate-y-5 animate-pulse">
            <rect x="133" y="82" width="50" height="35" rx="6" fill="white" stroke="#6C72FD" strokeWidth="1.5" />
            <rect x="139" y="90" width="38" height="4" rx="2" fill="#6366F1" />
            <rect x="139" y="98" width="28" height="4" rx="2" fill="#E2E8F0" />
            {/* Avatars */}
            <circle cx="165" cy="107" r="5" fill="#EF4444" />
            <circle cx="173" cy="107" r="5" fill="#10B981" />
          </g>

          {/* Floating Task Card 3 (Column 3 - Complete) */}
          <rect x="206" y="82" width="50" height="28" rx="6" fill="white" />
          <rect x="212" y="90" width="38" height="4" rx="2" fill="#94A3B8" />
          <path d="M242 100 L245 103 L250 97" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Visual connecting communication loops */}
          <path d="M100 130 Q160 80 220 130" stroke="white" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.6" strokeLinecap="round" />
          <path d="M220 140 Q160 190 100 140" stroke="white" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.6" strokeLinecap="round" />

          {/* Floating Avatars outside board */}
          <circle cx="85" cy="160" r="12" fill="#E0E7FF" stroke="white" strokeWidth="1.5" />
          <text x="85" y="164" fill="#4F46E5" fontSize="10" fontWeight="bold" textAnchor="middle">JD</text>

          <circle cx="235" cy="160" r="12" fill="#FEE2E2" stroke="white" strokeWidth="1.5" />
          <text x="235" y="164" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">AM</text>
          
          <ellipse cx="160" cy="225" rx="75" ry="5" fill="#1E293B" fillOpacity="0.15" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Insight & Analytics",
      description: "Gain complete transparency into daily performance metrics and track productivity metrics.",
      illustration: (
        <svg viewBox="0 0 320 280" className="w-full h-full max-h-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="140" r="100" fill="white" fillOpacity="0.04" filter="blur(20px)" />
          
          {/* Main Dashboard Widget Card */}
          <rect x="60" y="50" width="200" height="145" rx="16" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="2" />
          
          {/* Grid lines inside card */}
          <line x1="75" y1="160" x2="245" y2="160" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" />
          <line x1="75" y1="120" x2="245" y2="120" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" />
          <line x1="75" y1="80" x2="245" y2="80" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" />

          {/* Bar Chart 1 */}
          <rect x="90" y="110" width="16" height="50" rx="3" fill="#FFAE34" />
          <rect x="90" y="80" width="16" height="30" rx="3" fill="#FFC978" fillOpacity="0.4" />
          
          {/* Bar Chart 2 */}
          <rect x="120" y="70" width="16" height="90" rx="3" fill="white" />
          
          {/* Bar Chart 3 */}
          <rect x="150" y="95" width="16" height="65" rx="3" fill="#6C72FD" />
          
          {/* Circular Performance Gauge Widget */}
          <g className="translate-x-[185px] translate-y-[65px]">
            <circle cx="25" cy="25" r="22" stroke="white" strokeWidth="4" strokeOpacity="0.2" />
            <circle cx="25" cy="25" r="22" stroke="#22C55E" strokeWidth="4" strokeDasharray="138" strokeDashoffset="35" strokeLinecap="round" transform="rotate(-90 25 25)" />
            <text x="25" y="29" fill="white" fontSize="11" fontWeight="black" textAnchor="middle">75%</text>
          </g>

          {/* Rising Trend Line Overlay */}
          <path d="M75 150 L110 115 L145 130 L180 85 L215 95 L245 60" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pulsing endpoint marker */}
          <circle cx="245" cy="60" r="6" fill="#10B981" />
          <circle cx="245" cy="60" r="10" stroke="#10B981" strokeWidth="1.5" className="animate-ping" />

          <ellipse cx="160" cy="225" rx="75" ry="5" fill="#1E293B" fillOpacity="0.15" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="h-full flex flex-col justify-between items-center p-8 select-none text-white text-center">
      {/* Active Slide Illustration */}
      <div className="flex-1 w-full flex items-center justify-center min-h-[280px] transition-all duration-500 ease-in-out transform hover:scale-[1.03]">
        {slides[activeSlide].illustration}
      </div>

      {/* Slide Text Content */}
      <div className="mt-6 max-w-xs space-y-2">
        <h3 className="text-2xl font-black tracking-tight uppercase">
          {slides[activeSlide].title}
        </h3>
        <p className="text-sm font-semibold text-indigo-100/80 leading-relaxed italic">
          {slides[activeSlide].description}
        </p>
      </div>

      {/* Pagination Dot Selectors */}
      <div className="flex items-center gap-2 mt-8">
        {slides.map((slide, index) => {
          const isActive = activeSlide === index;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive ? "w-6 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
