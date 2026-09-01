import { Link } from "@tanstack/react-router";
import { Database } from "lucide-react";

/**
 * Non-blocking empty state for pages that need DataForSEO (keyword research,
 * backlinks, rank tracking, site audit). GSC and other free data sources work
 * without this key.
 */
export function DataForSeoSetupGate() {
  return (
    <section className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-base-300 bg-base-100 p-6 md:p-7 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-base-200 p-2.5 text-base-content/50 shrink-0">
            <Database className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">DataForSEO key not configured</h2>
            <p className="text-sm text-base-content/70">
              Keyword research, backlinks, rank tracking, and site audit need a{" "}
              <code>DATAFORSEO_API_KEY</code> environment variable. Search
              Console and other Google data work without it.
            </p>
            <p className="text-xs text-base-content/50">
              Setup steps are in the{" "}
              <Link
                className="link link-primary"
                to="/help/dataforseo-api-key"
              >
                DataForSEO API key guide
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
