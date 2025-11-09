"use client";

export default function LogoutButton() {
  return (
    <a
      href="/auth/logout"
      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
    >
      Log Out
    </a>
  );
}
