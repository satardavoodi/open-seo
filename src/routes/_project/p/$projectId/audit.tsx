import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DataForSeoPageGate } from "@/client/features/dataforseo/DataForSeoPageGate";

export const Route = createFileRoute("/_project/p/$projectId/audit")({
  component: SiteAuditLayout,
});

function SiteAuditLayout() {
  return (
    <DataForSeoPageGate>
      <Outlet />
    </DataForSeoPageGate>
  );
}
