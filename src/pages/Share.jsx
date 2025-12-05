import React from "react";
import ImageUploader from "../components/ImageUploader";
import { useAuth } from "../contexts/AuthContext";

export default function Share() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900">
            Donate an Item
          </h1>
          <p className="mt-3 text-base sm:text-lg text-emerald-800 max-w-2xl mx-auto">
            Upload a photo of your item and let our AI help you describe it. Then share it with people in your community who can give it a second life.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-2xl border border-emerald-100 p-4 sm:p-6 lg:p-8 soft-scale-hover">
          {user ? (
            <>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900">Upload & Analyze</h2>
                  <p className="mt-1 text-sm text-emerald-800/80">
                    Start by uploading a clear photo of the item you want to donate.
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-emerald-800 bg-emerald-50 px-3 py-2 rounded-full">
                  Signed in as <span className="font-medium">{user.email}</span>
                </div>
              </div>

              <ImageUploader userId={user?.uid || null} userEmail={user?.email || null} />
            </>
          ) : (
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold text-emerald-900 mb-2">Sign in to donate items</h2>
              <p className="text-emerald-800 mb-6 max-w-md mx-auto">
                You need an account to post donations so that recipients can contact you safely.
              </p>
              <a
                href="/login"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-900 bg-emerald-200 hover:bg-emerald-300"
              >
                Go to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
