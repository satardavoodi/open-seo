import type { ReactNode } from "react";
import { DataForSeoSetupGate } from "./DataForSeoSetupGate";
import { useDataForSeoConfigured } from "./useDataForSeoConfigured";

export function DataForSeoPageGate({ children }: { children: ReactNode }) {
  const { configured, isLoading } = useDataForSeoConfigured();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (configured === false) {
    return <DataForSeoSetupGate />;
  }

  return children;
}
