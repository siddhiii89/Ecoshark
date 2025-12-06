import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { submitNgoApplication } from "../services/ngoService";

export default function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // 'user' | 'ngo'
  const [ngoFile, setNgoFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const trimmedEmail = email.trim();

      if (role === "ngo") {
        if (!ngoFile) {
          setError("Please upload your NGO documentation as a PDF file.");
          setLoading(false);
          return;
        }
        if (ngoFile.type !== "application/pdf") {
          setError("NGO documentation must be a PDF file.");
          setLoading(false);
          return;
        }
      }

      const { user } = await signup(trimmedEmail, password);

      // If NGO selected, send an NGO application with optional document
      if (role === "ngo") {
        try {
          await submitNgoApplication(user, ngoFile, trimmedEmail);
        } catch (ngoErr) {
          console.error("Failed to submit NGO application", ngoErr);
        }
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border rounded-md p-6">
      <h2 className="text-xl font-semibold">Sign Up</h2>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm text-gray-700">Email</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Account type</label>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              <span>Normal user</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="role"
                value="ngo"
                checked={role === "ngo"}
                onChange={() => setRole("ngo")}
              />
              <span>NGO</span>
            </label>
          </div>
          {role === "ngo" && (
            <div className="mt-3 text-sm">
              <label className="block text-sm text-gray-700 mb-1">NGO documentation (optional)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setNgoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload your NGO registration or verification document as a PDF. It will be reviewed by an admin before NGO mode is enabled.
              </p>
            </div>
          )}
        </div>
        <button className="w-full bg-green-700 text-white py-2 rounded-md" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-green-700">Login</Link>
      </div>
    </div>
  );
}
