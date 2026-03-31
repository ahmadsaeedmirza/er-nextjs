"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      if (data.status === "success") {
        showToast("Login successful");
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 500);
      } else {
        showToast("Unable to login. Please try again.", "error");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid email or password";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity duration-300 ${
            toast.type === "error" ? "bg-red-600" : "bg-[#CF1745]"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-100 font-sans pt-20 md:pt-0">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-500 mt-2">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#CF1745] focus:border-[#CF1745] outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#CF1745] focus:border-[#CF1745] outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-gray-600"
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <a
                href="#"
                className="text-[#CF1745] font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CF1745] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
