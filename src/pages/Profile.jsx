import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiMail, FiCalendar, FiActivity, FiTrendingUp, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { fetchMyNgoRequest } from "../services/ngoService";

export default function Profile() {
  const { user } = useAuth();

  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "Recently";

  const displayName = user?.email?.split("@")?.[0] || "EcoSharer";

  // Listings state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoRequest, setNgoRequest] = useState(null);

  const impactStats = useMemo(() => {
    const count = items.length;
    return [
      {
        label: "Items You Shared",
        value: loading ? "-" : count.toString(),
        hint: "Based on your donations",
      },
      {
        label: "Estimated CO2 Savings",
        value: loading || count === 0 ? "-" : `${count * 3} kg CO2e`,
        hint: "Very rough estimate of carbon footprint avoided",
      },
      {
        label: "Community Items Shared",
        value: "1,024+",
        hint: "Across EcoShare",
      },
    ];
  }, [items, loading]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const arr = data || [];
      setItems(arr);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const loadNgo = async () => {
      if (!user) return;
      const req = await fetchMyNgoRequest(user.id);
      setNgoRequest(req);
    };
    loadNgo();
  }, [user]);

  const remove = async (id) => {
    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-md soft-scale-hover mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-900 flex items-center gap-2">
                <FiUser className="h-5 w-5" />
                {displayName}
              </h1>
              <p className="text-sm text-gray-600">EcoShare community member</p>
            </div>
          </div>
          {user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiMail className="h-4 w-4 text-emerald-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiCalendar className="h-4 w-4 text-emerald-500" />
                <span>Member since {joined}</span>
              </div>
              {ngoRequest && (
                <div className="mt-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <div className="font-semibold">
                    NGO mode: {ngoRequest.ngo_enabled ? "Enabled" : "Pending verification"}
                  </div>
                  {ngoRequest.ngo_enabled ? (
                    <p className="mt-1 text-xs text-emerald-900">
                      As an NGO account, a small platform fee of <span className="font-semibold">₹10–₹20 per item</span> will be charged for each exchange to help us maintain EcoShare.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-emerald-900">
                      Your NGO documentation is under review by an admin. Once approved, NGO mode will be enabled and a small platform fee of ₹10–₹20 per item will apply.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Impact Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 mb-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-emerald-900 flex items-center justify-center gap-2">
              <FiActivity className="h-6 w-6 text-emerald-500" />
              Your Impact
            </h2>
            <p className="mt-2 text-base text-emerald-800 max-w-2xl mx-auto">
              See how your donations help reduce waste and build a more sustainable future.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {impactStats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-6 text-center soft-scale-hover"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{s.value}</div>
                <div className="mt-1 text-sm font-medium text-emerald-700">{s.label}</div>
                <div className="mt-2 text-xs text-gray-500">{s.hint}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-7 soft-scale-hover mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-emerald-900">Community impact over time</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This is a simple illustrative chart to show how your community could be growing. Later, this can be connected to real data.
            </p>
            <div className="h-40 rounded-xl bg-gradient-to-r from-emerald-100 via-emerald-50 to-sky-100 flex items-end justify-between px-4 pb-4 text-[10px] text-emerald-800">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className="w-5 sm:w-6 rounded-full bg-emerald-300/80"
                    style={{ height: `${40 + idx * 7}px` }}
                  ></div>
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-emerald-900">How to increase your impact</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>Share items you no longer use instead of throwing them away.</li>
            <li>Encourage friends and family to join EcoShare and post their items.</li>
            <li>Write kind, clear descriptions so items find the right new home quickly.</li>
          </ul>
        </div>

        {/* My Listings Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-4">My Listings</h2>
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-gray-600">No listings yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-md border">
                  <Link to={`/listings/${item.id}`}>
                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded" />
                    <div className="mt-2 font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.age || "N/A"} • {item.location?.city || ""} {item.location?.zip || ""}</div>
                  </Link>
                  <button className="mt-2 w-full border py-1.5 rounded-md" onClick={() => remove(item.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
