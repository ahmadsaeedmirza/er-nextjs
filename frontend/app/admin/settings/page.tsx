"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  passwordChangedAt?: string;
  createdAt?: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SuccessModal {
  isOpen: boolean;
  timestamp?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<SuccessModal>({
    isOpen: false,
    timestamp: undefined,
  });

  // Load admin profile
  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/admin/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setAdmin(data?.data?.data);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Failed to load profile",
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    setPasswordError(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return false;
    }

    if (!passwordForm.newPassword) {
      setPasswordError("New password is required");
      return false;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return false;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("New password must be different from current password");
      return false;
    }

    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/admin/updateMyPassword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          passwordCurrent: passwordForm.currentPassword,
          password: passwordForm.newPassword,
          passwordConfirm: passwordForm.confirmPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to update password");
      }

      // Show success modal
      const now = new Date();
      const timestamp = now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setSuccessModal({
        isOpen: true,
        timestamp,
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Auto-logout after 3 seconds
      setTimeout(() => {
        logoutAndRedirect();
      }, 3000);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const logoutAndRedirect = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/v1/admin/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    router.push("/login");
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">
            Manage your admin account and security preferences
          </p>
        </div>

        {/* Admin Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <i className="fa-solid fa-user-circle text-3xl text-[#CF1745]"></i>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Admin Profile
              </h2>
              <p className="text-sm text-slate-500">Your account information</p>
            </div>
          </div>

          {isLoadingProfile ? (
            <div className="text-center py-8 text-slate-500">
              Loading profile...
            </div>
          ) : profileError ? (
            <div className="text-center py-8 text-red-600">{profileError}</div>
          ) : admin ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Name
                </label>
                <p className="text-base text-slate-900 mt-1">{admin.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Email
                </label>
                <p className="text-base text-slate-900 mt-1">{admin.email}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Account Created
                  </label>
                  <p className="text-sm text-slate-700 mt-1">
                    {formatDate(admin.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Last Password Change
                  </label>
                  <p className="text-sm text-slate-700 mt-1">
                    {formatDate(admin.passwordChangedAt)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <i className="fa-solid fa-lock text-2xl text-[#CF1745]"></i>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Change Password
              </h2>
              <p className="text-sm text-slate-500">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter your current password"
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:border-[#CF1745] transition"
                disabled={isChangingPassword}
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter your new password (min 8 characters)"
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:border-[#CF1745] transition"
                disabled={isChangingPassword}
              />
              <p className="text-xs text-slate-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm your new password"
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:border-[#CF1745] transition"
                disabled={isChangingPassword}
              />
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {passwordError}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
                  isChangingPassword
                    ? "bg-[#CF1745]/50 cursor-not-allowed"
                    : "bg-[#CF1745] hover:bg-[#b01338]"
                }`}
              >
                {isChangingPassword ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check mr-2"></i>
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-4 text-center">
            <div className="mb-4">
              <i className="fa-solid fa-check-circle text-5xl text-green-500"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Password Updated Successfully!
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Your password has been changed on{" "}
              <span className="font-semibold">{successModal.timestamp}</span>
            </p>
            <p className="text-xs text-slate-500 mb-6">
              For security, you will be logged out automatically...
            </p>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <i className="fa-solid fa-spinner animate-spin"></i>
                Redirecting to login
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
