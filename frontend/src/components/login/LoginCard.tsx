"use client";

import React from "react";

interface LoginCardProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export default function LoginCard({ children, maxWidth = "max-w-[420px]", className = "" }: LoginCardProps) {
  return (
    <div className={`w-full ${maxWidth} mx-auto glass-panel p-5 sm:p-6 shadow-[0_35px_90px_rgba(15,23,42,0.18)] dark:shadow-[0_35px_90px_rgba(0,0,0,0.35)] transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}
