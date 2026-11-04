import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatusBadge } from "../../src/admin/components/AdminLayout";
import { adminMe, getActivity, ActivityEvent } from "../../src/admin/api";

export default function AdminActivityPage() {
  const [adminName, setAdminName] = useState("");
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, data] = await Promise.all([adminMe(), getActivity(30)]);
        setAdminName(me.admin.name);
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity.");
      }
    }

    void load();
  }, []);

  return (
    <AdminLayout title="User & Platform Activity" adminName={adminName}>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <SectionPanel title="Recent Events">
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-indigo-900/30 bg-[#10162b] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium capitalize">{event.type.replace(/_/g, " ")}</p>
                  <p className="text-sm text-slate-400">{event.user}</p>
                </div>
                <div className="text-right">
                  {event.status && <StatusBadge status={event.status} />}
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(event.at).toLocaleString()}
                  </p>
                </div>
              </div>
              {event.pair && (
                <p className="mt-2 text-xs text-slate-500">
                  {event.pair}
                  {event.amountUsd ? ` · $${event.amountUsd.toLocaleString()}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionPanel>
    </AdminLayout>
  );
}
