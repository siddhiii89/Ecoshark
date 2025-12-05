import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("Password reset email sent.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border rounded-md p-6">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      {message && <div className="mt-2 text-green-700 text-sm">{message}</div>}
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm text-gray-700">Email</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <button className="w-full bg-green-700 text-white py-2 rounded-md" type="submit">Send reset email</button>
      </form>
    </div>
  );
}
