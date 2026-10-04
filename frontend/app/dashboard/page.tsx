"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import { EstimateResponse } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [data, setData] = useState<EstimateResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tameer_current_estimate');
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        router.push("/estimator");
      }
    } catch (e) {
      router.push("/estimator");
    }
  }, [router]);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-navy-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-sand-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Project Estimate</h1>
            <p className="text-navy-600">{data.requirements.plot_size} {data.requirements.plot_unit} in {data.requirements.city} • {data.requirements.floors} Floors</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/estimator")}>New Estimate</Button>
        </div>
        
        <DashboardView initialData={data} />
      </div>
    </div>
  );
}
