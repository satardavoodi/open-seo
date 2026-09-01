import { useState } from "react";
import { toast } from "sonner";
import {
  HOSTED_PASSWORD_MAX_LENGTH,
  HOSTED_PASSWORD_MIN_LENGTH,
} from "@/lib/auth-options";
import { resetManagedUserPassword } from "@/serverFunctions/users";

type ResetPasswordDialogProps = {
  userId: string | null;
  email: string | null;
  onClose: () => void;
};

export function ResetPasswordDialog({
  userId,
  email,
  onClose,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const open = Boolean(userId && email);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);
    try {
      await resetManagedUserPassword({ data: { userId, password } });
      toast.success("Password reset / رمز عبور تغییر کرد");
      setPassword("");
      onClose();
    } catch {
      toast.error("Could not reset password / تغییر رمز ناموفق بود");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`}>
      <form method="dialog" className="modal-box" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold">Reset password</h3>
        <p className="mt-1 text-sm text-base-content/60">{email}</p>
        <label className="form-control mt-4">
          <span className="label-text">New password</span>
          <input
            type="password"
            className="input input-bordered"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={HOSTED_PASSWORD_MIN_LENGTH}
            maxLength={HOSTED_PASSWORD_MAX_LENGTH}
          />
        </label>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
