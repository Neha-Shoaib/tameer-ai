import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Building2, HardHat, TrendingUp, Mic } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-emerald-50 to-sand-50 -z-10" />
      
      <div className="max-w-5xl mx-auto text-center space-y-8 mt-12 lg:mt-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-4 shadow-sm border border-emerald-200">
          <Building2 className="w-4 h-4" />
          <span>Hackathon 2024 MVP</span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold text-navy-900 tracking-tight text-balance leading-tight">
          Build Intelligent Agents to <span className="text-emerald-600">Reshape the Future</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-navy-600 max-w-2xl mx-auto font-medium">
          Tameer.ai: Unlock Potential & Drive Innovation. Your personal AI Civil Engineer and Quantity Surveyor. Speak your requirements, get a deterministic market-accurate estimate instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/estimator">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8 rounded-2xl">
              <Mic className="w-5 h-5" />
              Start Your Estimate
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl">
              View Saved Projects
            </Button>
          </Link>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card className="hover:shadow-md transition-soft">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-600 mb-4">
              <HardHat className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">No More Guesswork</h3>
            <p className="text-sm text-navy-600">Stop relying on rough contractor guesses. Get deterministic calculations based on Pakistani engineering formulas.</p>
          </Card>
          
          <Card className="hover:shadow-md transition-soft">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Live Market Rates</h3>
            <p className="text-sm text-navy-600">Powered by constantly updated local market rates for cement, steel, and labor. Edit rates to cross-check.</p>
          </Card>

          <Card className="hover:shadow-md transition-soft">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Complete BOQ & Timeline</h3>
            <p className="text-sm text-navy-600">Get a detailed Bill of Quantities, a phased construction schedule, and milestones to prevent overpaying.</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
