import EstimatorFlow from "@/components/EstimatorFlow";

export default function EstimatorPage() {
  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy-900">AI Estimation Engine</h1>
          <p className="text-navy-600 mt-2">Speak or type your home requirements in Urdu, Roman Urdu, or English.</p>
        </div>
        
        <EstimatorFlow />
      </div>
    </div>
  );
}
