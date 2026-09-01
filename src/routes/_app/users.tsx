import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserForm } from "@/client/features/users/CreateUserForm";
import { UsersPageHeader } from "@/client/features/users/UsersPageHeader";
import { UsersTable } from "@/client/features/users/UsersTable";
import { isSelfHostedClientAuthMode } from "@/lib/auth-mode";
import {
  getUserAdminAccess,
  listManagedUsers,
} from "@/serverFunctions/users";

export const Route = createFileRoute("/_app/users")({
  beforeLoad: () => {
    if (!isSelfHostedClientAuthMode()) {
      throw notFound();
    }
  },
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();

  const accessQuery = useQuery({
    queryKey: ["user-admin-access"],
    queryFn: () => getUserAdminAccess(),
  });

  const usersQuery = useQuery({
    queryKey: ["managed-users"],
    queryFn: () => listManagedUsers(),
    enabled: accessQuery.data?.canManageUsers === true,
  });

  function refreshUsers() {
    void queryClient.invalidateQueries({ queryKey: ["managed-users"] });
  }

  if (accessQuery.isPending) {
    return <UsersPageShell>Loading...</UsersPageShell>;
  }

  if (!accessQuery.data?.canManageUsers) {
    return (
      <UsersPageShell>
        <p className="text-sm text-base-content/60">
          Admin access required / فقط مدیران به این صفحه دسترسی دارند.
        </p>
      </UsersPageShell>
    );
  }

  return (
    <UsersPageShell>
      <UsersPageHeader />
      <CreateUserForm onCreated={refreshUsers} />
      <UsersTable
        users={usersQuery.data ?? []}
        onChanged={refreshUsers}
      />
    </UsersPageShell>
  );
}

function UsersPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-6 md:py-12 md:pb-8">
      <div className="mx-auto max-w-4xl space-y-8">{children}</div>
    </div>
  );
}
