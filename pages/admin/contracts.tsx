import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatusBadge } from "../../src/admin/components/AdminLayout";
import { adminMe, getContracts, reviewContract, syncContractsToApp, verifyContractOnExplorer, ContractRecord } from "../../src/admin/api";

export default function AdminContractsPage() {
  const [adminName, setAdminName] = useState("");
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, data] = await Promise.all([adminMe(), getContracts()]);
        setAdminName(me.admin.name);
        setContracts(data.contracts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contracts.");
      }
    }

    void load();
  }, []);

  async function handleReview(address: string, status: string) {
    try {
      const result = await reviewContract(address, { status });
      setContracts((current) =>
        current.map((item) => (item.address === address ? result.contract : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review contract.");
    }
  }

  async function handleSync() {
    try {
      setSyncMessage("");
      const result = await syncContractsToApp();
      setSyncMessage(
        `Synced ${result.approvedCount} approved contract(s) to ${result.files.adminContracts}` +
          (result.files.mainContractsPatched ? " (router patched in contracts.ts)" : "")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync contracts.");
    }
  }

  async function handleVerify(address: string) {
    try {
      setError("");
      const result = await verifyContractOnExplorer(address);
      if (result.contract) {
        setContracts((current) =>
          current.map((item) => (item.address === address ? result.contract! : item))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify contract.");
    }
  }

  return (
    <AdminLayout title="Contract Review" adminName={adminName}>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      {syncMessage && <p className="mb-4 text-emerald-400">{syncMessage}</p>}

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSync()}
          className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm text-indigo-200 hover:bg-indigo-500/30"
        >
          Sync approved to main app
        </button>
      </div>

      <SectionPanel title="Contract Registry">
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.address} className="rounded-xl border border-indigo-900/30 bg-[#10162b] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{contract.name}</p>
                  <p className="text-xs text-slate-500">{contract.address}</p>
                  <p className="mt-2 text-sm text-slate-400">{contract.notes}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={contract.status} />
                  <StatusBadge status={contract.type} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleVerify(contract.address)}
                  className="rounded-lg bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300"
                >
                  Verify on explorer
                </button>
              </div>

              {contract.status === "pending_review" && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleReview(contract.address, "approved")}
                    className="rounded-lg bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReview(contract.address, "rejected")}
                    className="rounded-lg bg-red-500/15 px-3 py-1 text-xs text-red-300"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionPanel>
    </AdminLayout>
  );
}
