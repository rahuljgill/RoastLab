import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.message ||
          (data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "Registration failed.");
        throw new Error(message);
      }

      return data;
    },

    onSuccess: (data) => {
      // store token
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

    registerMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <div className="bg-dark-bg text-white min-h-screen font-(--font-body)">
      <Navbar alwaysVisible={true} />

      <div className="flex items-center justify-center min-h-screen px-6 pt-24">
        <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-semibold mb-2 text-center text-brand">
            Create an Account
          </h2>

          <p className="text-dark-muted text-center mb-8">
            Join RoastLab and build your perfect blend
          </p>

          {formError && (
            <div className="mb-6 rounded-lg border border-dark-border bg-dark-bg px-4 py-3 text-sm text-white">
              <span className="text-brand font-semibold">Error:</span>{" "}
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-dark-muted">Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white placeholder-white focus:border-brand outline-none"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="text-sm text-dark-muted">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white placeholder-white focus:border-brand outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm text-dark-muted">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white placeholder-white focus:border-brand outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-brand text-black py-3 rounded-lg font-semibold hover:bg-brand-hover transition disabled:opacity-60"
            >
              {registerMutation.isPending ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center text-dark-muted mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
