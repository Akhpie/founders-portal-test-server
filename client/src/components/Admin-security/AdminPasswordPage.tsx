import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://founders-portal-test-server-apii.onrender.com/api/admin/verify-admin-password",
        {
          password,
        }
      );

      if (response.data.success) {
        // Secure token storage
        localStorage.setItem("adminToken", response.data.token);
        navigate("/admin");
      }
    } catch {
      setError("Invalid password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default AdminPasswordPage;
