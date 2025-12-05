import React from "react";
import { FiActivity, FiTrendingUp, FiClock } from "react-icons/fi";

const stats = [
  { label: "Items You Shared", value: "3", hint: "Based on your donations" },
  { label: "Estimated Waste Diverted", value: "12 kg", hint: "Approximate based on item types" },
  { label: "Community Items Shared", value: "1,024+", hint: "Across EcoShare" },
];

export default function Impact() {
  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900 flex items-center justify-center gap-3">
            <FiActivity className="h-8 w-8 text-emerald-500" />
            Your Impact
          </h1>
          <p className="mt-3 text-base sm:text-lg text-emerald-800 max-w-2xl mx-auto">
            See how your donations (and your community) are helping reduce waste and build a more sustainable future.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
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
            <h2 className="text-lg font-semibold text-emerald-900">Community impact over time</h2>
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

        <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-7 soft-scale-hover">
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-emerald-900">How to increase your impact</h2>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>Share items you no longer use instead of throwing them away.</li>
            <li>Encourage friends and family to join EcoShare and post their items.</li>
            <li>Write kind, clear descriptions so items find the right new home quickly.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
