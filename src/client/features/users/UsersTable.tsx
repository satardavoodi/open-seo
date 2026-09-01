import { useState } from "react";
import { toast } from "sonner";
import { setManagedUserDisabled } from "@/serverFunctions/users";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export type ManagedUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  createdAt: Date;
};

type UsersTableProps = {
  users: ManagedUserRow[];
  onChanged: () => void;
};

export function UsersTable({ users, onChanged }: UsersTableProps) {
  const [resetTarget, setResetTarget] = useState<ManagedUserRow | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  async function toggleDisabled(user: ManagedUserRow) {
    setBusyUserId(user.id);
    try {
      await setManagedUserDisabled({
        data: { userId: user.id, disabled: !user.disabled },
      });
      toast.success(user.disabled ? "User enabled" : "User disabled");
      onChanged();
    } catch {
      toast.error("Action failed / عملیات ناموفق بود");
    } finally {
      setBusyUserId(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-base-content/60">
        No users yet. Create the first account above.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role / نقش</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="font-mono text-sm" data-ph-mask>
                  {user.email}
                </td>
                <td>{user.role}</td>
                <td>
                  {user.disabled ? (
                    <span className="badge badge-warning">Disabled</span>
                  ) : (
                    <span className="badge badge-success badge-outline">
                      Active
                    </span>
                  )}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setResetTarget(user)}
                    >
                      Reset password
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={busyUserId === user.id}
                      onClick={() => void toggleDisabled(user)}
                    >
                      {user.disabled ? "Enable" : "Disable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResetPasswordDialog
        userId={resetTarget?.id ?? null}
        email={resetTarget?.email ?? null}
        onClose={() => setResetTarget(null)}
      />
    </>
  );
}
