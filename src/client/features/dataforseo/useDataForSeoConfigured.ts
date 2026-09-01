import { useQuery } from "@tanstack/react-query";
import { getSeoApiKeyStatus } from "@/serverFunctions/config";

export function useDataForSeoConfigured() {
  const query = useQuery({
    queryKey: ["seoApiKeyStatus"],
    queryFn: () => getSeoApiKeyStatus(),
  });

  return {
    configured: query.data?.configured ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
