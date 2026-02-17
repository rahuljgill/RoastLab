import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.message ||
          (data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "Login failed.");
        throw new Error(message);
      }

      return data;
    },

    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      if (data?.user) {
        queryClient.setQueryData(["me"], data.user);
      }

      navigate("/");
    },

    onError: (err) => {
      setFormError(err?.message || "Something went wrong.");
    },
  });

  const handleChange = (e) => {
    setFormError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
      <Navbar alwaysVisible={true} />

      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold mb-2 text-center text-brand">
          Welcome Back
        </h1>

        <p className="text-dark-muted text-center mb-8">
          Sign in to your RoastLab account
        </p>

        {formError && (
          <div className="mb-6 rounded-lg border border-dark-border bg-dark-bg px-4 py-3 text-sm text-white">
            <span className="text-brand font-semibold">Error:</span> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm mb-2 text-dark-muted">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand text-white placeholder:text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-2 text-dark-muted">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand text-white placeholder:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-brand text-black py-3 rounded-lg font-semibold hover:bg-brand-hover transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center text-dark-muted mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-brand hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
