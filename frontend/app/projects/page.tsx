"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Building2, Calendar, Trash2 } from "lucide-react";
import { formatCroreLakh } from "@/lib/utils";

interface SavedProject {
  id: string;
  title: string;
  date: string;
  data: any;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tameer_projects') || '[]');
      setProjects(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('tameer_projects', JSON.stringify(updated));
  };

  const handleOpen = (project: SavedProject) => {
    localStorage.setItem('tameer_current_estimate', JSON.stringify(project.data));
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-navy-900">Saved Projects</h1>
          <Link href="/estimator">
            <Button>New Estimate</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <Building2 className="w-12 h-12 text-navy-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-navy-600">No projects yet</h3>
            <p className="text-sm text-navy-400 mt-1">Start by creating your first estimate.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((proj) => (
              <Card key={proj.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-200 transition-colors">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">{proj.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-navy-500 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(proj.date).toLocaleDateString()}</span>
                    <span className="font-medium text-emerald-600">{formatCroreLakh(proj.data.cost_summary?.grand_total || 0)}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(proj.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button className="flex-1 sm:flex-none" onClick={() => handleOpen(proj)}>
                    Open
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
