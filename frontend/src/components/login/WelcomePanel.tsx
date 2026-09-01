"use client";

import React from "react";
import HeroSection from "./HeroSection";
import Metrics from "./Metrics";
import FeatureList from "./FeatureList";
import TrustBadges from "./TrustBadges";
import DashboardPreview from "./DashboardPreview";

export default function WelcomePanel() {
  return (
    <div className="h-full flex flex-col justify-between py-2 sm:py-3 select-none space-y-4 lg:space-y-0 min-w-0 pr-0 lg:pr-6">
      {/* Brand logo & Hero Title Header */}
      <HeroSection />

      {/* Numerical Feature Highlight Frosted Cards */}
      <FeatureList />

      {/* KPI Cards / Statistics Widgets */}
      <Metrics />

      {/* Compliance Trust Badges grid */}
      <TrustBadges />

      {/* Mock Dashboard Preview Panel */}
      <DashboardPreview />
    </div>
  );
}
