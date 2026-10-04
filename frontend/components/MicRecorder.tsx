"use client";
import React, { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/Toast";

interface MicRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export default function MicRecorder({ onRecordingComplete }: MicRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/mp4' }; // Safari fallback
      }
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: options.mimeType });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Mic access denied", err);
      toast("Microphone Access Denied", "Please allow mic permissions or use the text input fallback.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="relative">
        {isRecording && (
          <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95",
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
          )}
        >
          {isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : <Mic className="w-10 h-10" />}
        </button>
      </div>

      <div className="text-center">
        {isRecording ? (
          <div className="space-y-2 animate-in fade-in">
            <p className="text-red-500 font-mono text-xl font-bold">{formatTime(duration)}</p>
            <div className="flex gap-1 items-center justify-center h-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-1 bg-emerald-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-navy-600 font-medium">Tap to speak your requirements</p>
        )}
      </div>
    </div>
  );
}
