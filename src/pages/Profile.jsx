import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiMail, FiGift, FiCalendar } from "react-icons/fi";

export default function Profile() {
  const { user } = useAuth();

  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "Recently";

  const displayName = user?.email?.split("@")[0] || "EcoSharer";

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-md soft-scale-hover">
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

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiMail className="h-4 w-4 text-emerald-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiCalendar className="h-4 w-4 text-emerald-500" />
                <span>Member since {joined}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiGift className="h-4 w-4 text-emerald-500" />
                <span>Donations shared: <strong>3</strong> (example)</span>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                In the future, this page can show your full activity history, badges, and more detailed impact
                statistics.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              You need to sign in to view your profile.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
