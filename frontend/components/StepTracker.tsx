"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, Activity, Mic, Layers, Coins, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTrackerProps {
  isActive: boolean;
}

const STEPS = [
  { id: 'extract', label: 'Requirement & Voice Agent', icon: Mic },
  { id: 'boq', label: 'Estimation & BOQ Agent', icon: Layers },
  { id: 'price', label: 'Market Pricing Agent', icon: Coins },
  { id: 'time', label: 'Timeline & Milestone Agent', icon: MapPin },
];

export default function StepTracker({ isActive }: StepTrackerProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Simulate step progression while API request is inflight for the wow-factor
  useEffect(() => {
    if (!isActive) return;
    
    setActiveStepIndex(0);
    const interval = setInterval(() => {
      setActiveStepIndex(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h3 className="text-center font-semibold text-navy-800 mb-6 flex items-center justify-center gap-2">
        <Activity className="w-5 h-5 text-emerald-500 animate-pulse" /> 
        Agents at Work...
      </h3>
      <div className="space-y-4">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex && isActive;
          const Icon = step.icon;

          return (
            <div key={step.id} className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
              isCurrent ? "bg-white border-emerald-200 shadow-md transform scale-[1.02]" : "bg-sand-50/50 border-sand-100",
              isCompleted ? "opacity-70" : (isCurrent ? "opacity-100" : "opacity-40")
            )}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500",
                isCompleted ? "bg-emerald-500 text-white" : (isCurrent ? "bg-emerald-100 text-emerald-600" : "bg-sand-200 text-navy-400")
              )}>
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-navy-900">{step.label}</p>
                {isCurrent && <p className="text-xs text-navy-500 animate-pulse mt-1">Processing...</p>}
                {isCompleted && <p className="text-xs text-emerald-600 mt-1">Done</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
