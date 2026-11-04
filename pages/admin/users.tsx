import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatusBadge } from "../../src/admin/components/AdminLayout";
import { adminMe, getUsers, PlatformUser, updateUserStatus } from "../../src/admin/api";

export default function AdminUsersPage() {
  const [adminName, setAdminName] = useState("");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, data] = await Promise.all([adminMe(), getUsers()]);
        setAdminName(me.admin.name);
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users.");
      }
    }

    void load();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    try {
      const result = await updateUserStatus(id, status);
      setUsers((current) => current.map((user) => (user.id === id ? result.user : user)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user.");
    }
  }

  return (
    <AdminLayout title="Users & Identity" adminName={adminName}>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <SectionPanel title="User Registry">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Wallet</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Risk</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-indigo-900/20">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">
                    {user.walletAddress || "Not linked"}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={user.riskLevel} />
                  </td>
                  <td className="py-3">
                    <select
                      value={user.status}
                      onChange={(event) => void handleStatusChange(user.id, event.target.value)}
                      className="rounded-lg border border-indigo-900/40 bg-[#10162b] px-2 py-1 text-xs text-white"
                    >
                      <option value="active">active</option>
                      <option value="idle">idle</option>
                      <option value="flagged">flagged</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </AdminLayout>
  );
}
