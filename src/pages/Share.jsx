import React from "react";
import ImageUploader from "../components/ImageUploader";
import { useAuth } from "../contexts/AuthContext";

export default function Share() {
  const { user } = useAuth();
  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-2">Share & Donate</h2>
      <p className="text-gray-600 mb-4">Upload an item photo. Our AI will suggest reuse/recycle tips and prefill your donation post.</p>
      <div className="bg-white p-4 rounded-md border">
        <ImageUploader userId={user?.uid || null} userEmail={user?.email || null} />
      </div>
    </div>
  );
}
