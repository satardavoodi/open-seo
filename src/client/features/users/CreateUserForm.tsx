import { useState } from "react";
import { toast } from "sonner";
import {
  HOSTED_PASSWORD_MAX_LENGTH,
  HOSTED_PASSWORD_MIN_LENGTH,
} from "@/lib/auth-options";
import { createManagedUser } from "@/serverFunctions/users";

type CreateUserFormProps = {
  onCreated: () => void;
};

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createManagedUser({ data: { email, password, role } });
      toast.success("User created / کاربر ایجاد شد");
      setEmail("");
      setPassword("");
      setRole("member");
      onCreated();
    } catch {
      toast.error("Could not create user / ایجاد کاربر ناموفق بود");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-3 rounded-box border border-base-300 p-4">
      <h2 className="text-sm font-medium text-base-content/70">
        Create user <span className="text-base-content/50">کاربر جدید</span>
      </h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="form-control">
          <span className="label-text">Email</span>
          <input
            type="email"
            className="input input-bordered"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text">Password</span>
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
        <label className="form-control">
          <span className="label-text">Role / نقش</span>
          <select
            className="select select-bordered"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "admin" | "member")
            }
          >
            <option value="member">Member / عضو</option>
            <option value="admin">Admin / مدیر</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create / ایجاد"}
          </button>
        </div>
      </form>
    </section>
  );
}
