import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-mesh-gradient transition-colors duration-300">
      {children}
    </div>
  );
}
