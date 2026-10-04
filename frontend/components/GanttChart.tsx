"use client";
import React from "react";
import { TimelinePhase } from "@/lib/api";

export default function GanttChart({ phases }: { phases: TimelinePhase[] }) {
  // Find total weeks to set grid columns
  const maxWeek = Math.max(...phases.map(p => p.start_week + p.duration_weeks));
  const cols = Array.from({ length: maxWeek }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        {/* Header (Weeks) */}
        <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
          <div className="font-semibold text-navy-800 text-sm pl-2">Phase</div>
          <div className="flex">
            {cols.map(w => (
              <div key={w} className="flex-1 text-center text-xs text-navy-400 font-medium border-l border-sand-200">
                W{w}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {phases.map((phase, idx) => {
            const startPct = ((phase.start_week - 1) / maxWeek) * 100;
            const widthPct = (phase.duration_weeks / maxWeek) * 100;
            
            return (
              <div key={idx} className="grid grid-cols-[200px_1fr] gap-4 items-center group">
                <div className="text-sm font-medium text-navy-900 group-hover:text-emerald-600 transition-colors line-clamp-1 pr-2" title={phase.name}>
                  {phase.name}
                </div>
                <div className="relative h-8 bg-sand-100 rounded-lg overflow-hidden border border-sand-200">
                  <div 
                    className="absolute top-0 bottom-0 bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center min-w-[30px]"
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {phase.payment_milestone_percent}% Pay
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}s
