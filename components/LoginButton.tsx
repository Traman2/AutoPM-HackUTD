"use client";

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      Log In
    </a>
  );
}
