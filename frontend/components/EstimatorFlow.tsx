"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import MicRecorder from "./MicRecorder";
import StepTracker from "./StepTracker";
import { useToast } from "./ui/Toast";
import { api, EstimateResponse } from "@/lib/api";

export default function EstimatorFlow() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "transcribing" | "pipeline">("idle");

  const handleAudioComplete = async (blob: Blob) => {
    setStatus("transcribing");
    try {
      const res = await api.transcribeAudio(blob);
      setTextInput(res.text);
      toast("Audio Transcribed", "Check the text and generate your estimate.", "success");
      setStatus("idle");
    } catch (error) {
      toast("Transcription Error", "Please try again or use the text box.", "error");
      setStatus("idle");
    }
  };

  const handleGenerate = async () => {
    if (!textInput.trim()) {
      toast("Empty Input", "Please record or type your requirements.", "error");
      return;
    }
    
    setIsProcessing(true);
    setStatus("pipeline");
    try {
      const response = await api.runPipelineText(textInput);
      
      // Store locally for MVP (simulate DB session)
      const projects = JSON.parse(localStorage.getItem('tameer_projects') || '[]');
      projects.push({
        id: response.id,
        title: `${response.requirements.plot_size} ${response.requirements.plot_unit} - ${response.requirements.city}`,
        data: response,
        date: new Date().toISOString()
      });
      localStorage.setItem('tameer_projects', JSON.stringify(projects));
      localStorage.setItem('tameer_current_estimate', JSON.stringify(response));
      
      toast("Estimate Generated!", "View your comprehensive dashboard.", "success");
      router.push("/dashboard");
    } catch (error) {
      toast("Estimation Failed", "Our AI engineers hit a snag. Is the backend awake? (Render cold start)", "error");
      setIsProcessing(false);
      setStatus("idle");
    }
  };

  const setSampleText = () => {
    setTextInput("Mujhe 120 gaz ke plot par ground plus one ghar banana hai, 3 kamray aur 2 washroom honge, standard quality in Karachi.");
  };

  if (status === "pipeline") {
    return <StepTracker isActive={true} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <Card className="p-8">
        <MicRecorder onRecordingComplete={handleAudioComplete} />
        
        {status === "transcribing" && (
          <p className="text-center text-emerald-600 animate-pulse font-medium mt-4">Transcribing Urdu/English...</p>
        )}

        <div className="mt-8 pt-8 border-t border-sand-200">
          <label className="block text-sm font-semibold text-navy-800 mb-2">
            Or type your requirements here:
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full h-32 rounded-xl border border-sand-200 bg-sand-50 p-4 text-navy-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-soft"
            placeholder="E.g., 120 gaz plot, ground + 1, 3 beds, standard tier..."
          />
          <div className="flex justify-between mt-3">
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 bg-sand-200 rounded-md text-navy-600">Urdu</span>
              <span className="text-xs px-2 py-1 bg-sand-200 rounded-md text-navy-600">Roman Urdu</span>
              <span className="text-xs px-2 py-1 bg-sand-200 rounded-md text-navy-600">English</span>
            </div>
            <button onClick={setSampleText} className="text-xs text-emerald-600 font-medium hover:underline">
              Try Sample Prompt
            </button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="w-full sm:w-auto px-12" onClick={handleGenerate} isLoading={isProcessing}>
          Generate Detailed Estimate
        </Button>
      </div>
    </div>
  );
}
