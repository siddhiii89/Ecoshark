import React, { useEffect, useState } from "react";
import { fetchAllNgoRequests, updateNgoRequest } from "../services/ngoService";

export default function Admin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllNgoRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load NGO requests");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdate = async (id, updates) => {
    try {
      const updated = await updateNgoRequest(id, updates);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

  if (loading) return <div className="p-6">Loading admin data...</div>;

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-emerald-900">Admin Panel - NGO Verification</h1>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {requests.length === 0 ? (
          <div className="text-sm text-gray-600">No NGO applications yet.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="border border-emerald-100 rounded-xl p-4 flex flex-col gap-2">
                <div className="text-sm text-gray-800">
                  <span className="font-semibold">User:</span> {r.email} ({r.user_id})
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Status:</span> {r.status || "pending"} | NGO enabled: {r.ngo_enabled ? "Yes" : "No"}
                </div>
                {r.doc_url && (
                  <a
                    href={r.doc_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-emerald-700 underline"
                  >
                    View documentation
                  </a>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    className="px-3 py-1 text-xs rounded-md bg-emerald-600 text-white"
                    onClick={() => handleUpdate(r.id, { status: "approved", ngo_enabled: true })}
                  >
                    Approve & Enable NGO
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-md bg-yellow-500 text-white"
                    onClick={() => handleUpdate(r.id, { status: "pending", ngo_enabled: false })}
                  >
                    Mark Pending
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-md bg-red-600 text-white"
                    onClick={() => handleUpdate(r.id, { status: "rejected", ngo_enabled: false })}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
