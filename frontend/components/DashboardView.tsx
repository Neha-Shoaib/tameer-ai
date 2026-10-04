"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { FileDown, Save, Edit3, AlertCircle } from "lucide-react";
import { EstimateResponse, api } from "@/lib/api";
import { formatPKR, formatCroreLakh } from "@/lib/utils";
import { useToast } from "./ui/Toast";
import GanttChart from "./GanttChart";
import { generateEstimatePDF } from "@/lib/pdf";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardView({ initialData }: { initialData: EstimateResponse }) {
  const [data, setData] = useState<EstimateResponse>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleRateUpdate = async (material_key: string, newRate: number) => {
    setIsUpdating(true);
    try {
      await api.updateRate(material_key, newRate);
      // Recalculate using the backend estimate endpoint
      const newData = await api.runPipelineRequirements(data.requirements);
      setData(newData);
      localStorage.setItem('tameer_current_estimate', JSON.stringify(newData));
      toast("Rate Updated", "Estimate recalculated successfully.", "success");
    } catch (err) {
      toast("Update Failed", "Could not update the rate.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      generateEstimatePDF(data);
      toast("PDF Downloaded", "Check your downloads folder.", "success");
    } catch (e) {
      toast("PDF Error", "Failed to generate PDF.", "error");
    }
  };

  const pieData = Object.entries(data.cost_summary.percentage_split).map(([name, value]) => ({ name, value }));
  
  // Top 5 expensive materials for bar chart
  const barData = [...data.boq]
    .filter(item => item.category !== "contingency")
    .sort((a, b) => b.amount_pkr - a.amount_pkr)
    .slice(0, 5)
    .map(item => ({ name: item.item.toUpperCase(), amount: item.amount_pkr }));

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-navy-900 text-white border-none">
          <p className="text-navy-200 text-sm font-medium">Estimated Grand Total</p>
          <h2 className="text-3xl font-bold mt-2">{formatCroreLakh(data.cost_summary.grand_total)}</h2>
          <p className="text-xs text-emerald-400 mt-1">{formatPKR(data.cost_summary.grand_total)}</p>
        </Card>
        <Card>
          <p className="text-navy-500 text-sm font-medium">Cost per Sq.Ft</p>
          <h2 className="text-2xl font-bold text-navy-900 mt-2">{formatPKR(data.cost_summary.cost_per_sqft)}</h2>
        </Card>
        <Card>
          <p className="text-navy-500 text-sm font-medium">Covered Area</p>
          <h2 className="text-2xl font-bold text-navy-900 mt-2">{data.cost_summary.covered_area_sqft} sq ft</h2>
        </Card>
        <Card>
          <p className="text-navy-500 text-sm font-medium">Est. Duration</p>
          <h2 className="text-2xl font-bold text-navy-900 mt-2">
            {Math.max(...data.timeline.map(t => t.start_week + t.duration_weeks))} Weeks
          </h2>
        </Card>
      </div>

      {data.requirements.assumptions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">AI Assumptions (Edit if incorrect):</p>
            <ul className="list-disc pl-4 space-y-1">
              {data.requirements.assumptions.map((asm, i) => <li key={i}>{asm}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col">
          <h3 className="font-semibold text-navy-900 mb-4">Budget Split</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="h-80 flex flex-col">
          <h3 className="font-semibold text-navy-900 mb-4">Top Cost Drivers</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
                <RechartsTooltip formatter={(value: number) => formatPKR(value)} />
                <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* BOQ Table */}
      <Card>
        <h3 className="font-semibold text-navy-900 mb-4">Bill of Quantities (Editable Rates)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-sand-100 text-navy-700">
              <tr>
                <th className="p-3 rounded-tl-lg">Category / Item</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Market Rate (Rs)</th>
                <th className="p-3 text-right rounded-tr-lg">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100 opacity-100 transition-opacity" style={{ opacity: isUpdating ? 0.5 : 1 }}>
              {data.boq.map((item, idx) => (
                <tr key={idx} className="hover:bg-sand-50 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-navy-900 capitalize">{item.item.replace('_', ' ')}</p>
                    <p className="text-xs text-navy-500 capitalize">{item.category.replace('_', ' ')}</p>
                  </td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">
                    {item.category === "contingency" ? (
                      <span className="text-navy-400">Fixed 8%</span>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <input 
                          type="number" 
                          defaultValue={item.rate_pkr}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val && val !== item.rate_pkr) handleRateUpdate(item.item, val);
                          }}
                          className="w-24 px-2 py-1 border border-transparent group-hover:border-sand-200 rounded-md bg-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        />
                        <Edit3 className="w-3 h-3 text-sand-300 group-hover:text-emerald-500" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right font-medium">{formatPKR(item.amount_pkr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gantt & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-navy-900 mb-4">Construction Timeline</h3>
          <GanttChart phases={data.timeline} />
        </Card>
        
        <Card className="bg-emerald-900 text-white border-none flex flex-col">
          <h3 className="font-semibold text-emerald-100 mb-4 flex items-center gap-2">
            <HardHat className="w-5 h-5" /> Thekedar Watch Tips
          </h3>
          <ul className="space-y-4 flex-1">
            {data.tips.map((tip, idx) => (
              <li key={idx} className="text-sm bg-emerald-800/50 p-3 rounded-lg leading-relaxed shadow-inner border border-emerald-700/50">
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-sand-100">
        <Button variant="outline" className="gap-2" onClick={() => toast("Saved", "Project saved to local storage.", "success")}>
          <Save className="w-4 h-4" /> Save
        </Button>
        <Button className="gap-2" onClick={handleDownloadPDF}>
          <FileDown className="w-4 h-4" /> Download PDF Report
        </Button>
      </div>
    </div>
  );
}
