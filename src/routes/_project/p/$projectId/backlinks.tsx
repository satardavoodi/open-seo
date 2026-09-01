import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DataForSeoPageGate } from "@/client/features/dataforseo/DataForSeoPageGate";
import { BacklinksPage } from "@/client/features/backlinks/BacklinksPage";
import {
  DEFAULT_BACKLINKS_PAGE_SIZE,
  backlinksSearchSchema,
} from "@/types/schemas/backlinks";
import { defaultScopeForInput } from "@/shared/researchScope";

export const Route = createFileRoute("/_project/p/$projectId/backlinks")({
  validateSearch: backlinksSearchSchema,
  component: BacklinksRoute,
});

function BacklinksRoute() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const {
    target = "",
    scope: rawScope,
    tab = "backlinks",
    page = 1,
    size = DEFAULT_BACKLINKS_PAGE_SIZE,
    sort,
    order,
    view,
  } = Route.useSearch();
  const scope = rawScope ?? defaultScopeForInput(target);

  return (
    <DataForSeoPageGate>
      <BacklinksPage
        projectId={projectId}
        navigate={navigate}
        searchState={{
          target,
          scope,
          // Referring domains can't be filtered to a subfolder.
          tab: scope === "subfolder" && tab === "domains" ? "backlinks" : tab,
          page,
          pageSize: size,
          sort,
          order,
          view,
        }}
      />
    </DataForSeoPageGate>
  );
}
