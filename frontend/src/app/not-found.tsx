import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">পাতা পাওয়া যায়নি (404)</h1>
          <p className="text-slate-400 text-sm mb-8">
            This page has either been moved or doesn't exist. Features like Forecast, Advisory, and Crop Recommendations have been consolidated into the interactive Map and Plot Details views for the hackathon MVP.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            ড্যাশবোর্ডে ফিরে যান (Back to Dashboard)
          </Link>
        </div>
      </main>
    </div>
  );
}
