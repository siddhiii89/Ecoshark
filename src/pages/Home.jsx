import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="py-8">
      <div className="bg-white rounded-xl p-6 border">
        <h1 className="text-2xl font-semibold text-gray-900">EcoShare</h1>
        <p className="text-gray-600 mt-2">
          EcoShare helps people donate reusable items instead of throwing them away.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/listings" className="px-4 py-2 rounded-md border border-gray-300 text-gray-800">View Listings</Link>
          <Link to="/share" className="px-4 py-2 rounded-md bg-green-700 text-white">Share & Donate</Link>
        </div>
      </div>
    </div>
  );
}
