"use client";

import React, { use, useRef, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoggingIn(false);
    if (error) {
      setLoginError(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-2 text-center font-bold text-2xl text-gray-800"
        >
          <Library className="h-7 w-7" />
          <span>BookShelf</span>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          A curated list of books from supabase
        </p>
      </div>

      {/* Upload Card */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          📚 Login
        </h1>

        <form onSubmit={handleLogin}>
          <div className="flex justify-center w-full sm:w-1/2 lg:w-1/3 mx-auto h-8 mb-3">
            <div className="relative w-full">
              <Input
                className="pl-2 h-8 text-sm"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-center w-full sm:w-1/2 lg:w-1/3 mx-auto h-8 mb-3">
            <div className="relative w-full">
              <Input
                className="pl-2 h-8 text-sm"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {loginError && (
            <div className="text-red-500 text-xs text-center mb-2">
              {loginError}
            </div>
          )}

          <div className="flex justify-center w-full sm:w-1/2 lg:w-1/3 mx-auto h-8 mb-3">
            <div className="relative w-full">
              <button
                type="submit"
                disabled={loggingIn}
                className="cursor-pointer flex items-center gap-1 border-1 border-gray-200 hover:bg-slate-200 px-3 py-1.5 rounded-md shadow transition font-medium"
                aria-label="Login"
              >
                <span className="hidden sm:inline">
                  {loggingIn ? "Logging in..." : "Login"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
