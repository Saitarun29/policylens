import { Suspense } from "react";
import AnalyzeClient from "./client";

export const maxDuration = 60;

export default function AnalyzePage() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
              <p className="text-sm text-muted-foreground">Initializing...</p>
            </div>
          </div>
        }
      >
        <AnalyzeClient />
      </Suspense>
    </main>
  );
}