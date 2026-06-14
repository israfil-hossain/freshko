"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useSocketStore } from "@/lib/socket";

const GOOGLE_CLIENT_ID = "722221923020-krinde3innbmvf7v20q0flohbj7psoo7.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginModal() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const showUserLogin = useUIStore((s) => s.showUserLogin);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const connectSocket = useSocketStore((s) => s.connect);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existingScript = document.querySelector('script[src*="accounts.google.com"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      if (googleBtnRef.current) {
        window.google?.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: googleBtnRef.current.offsetWidth || 400,
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleGoogleResponse = async (response: { credential: string }) => {
    if (!response.credential) {
      toast.error("Google sign-in failed");
      return;
    }
    try {
      const result = await googleLogin(response.credential);
      if (result.success && result.user) {
        connectSocket(result.user._id);
        toast.success("Logged in with Google!");
        setShowUserLogin(false);
        router.refresh();
      } else {
        toast.error(result.message || "Google login failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Google login failed");
    }
  };

  // Email login
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result =
        mode === "login"
          ? await login(email, password)
          : await register(name, email, password);

      if (result.success && result.user) {
        connectSocket(result.user._id);
        toast.success(mode === "login" ? "Logged in!" : "Registered!");
        setShowUserLogin(false);
        router.refresh();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showUserLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-8 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setShowUserLogin(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "login" && "Welcome Back"}
            {mode === "register" && "Create Account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login" && "Sign in to your account"}
            {mode === "register" && "Join Freshko today"}
          </p>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <div ref={googleBtnRef} id="googleSignInBtn" />
          </div>
        </div>

        {/* Toggle login/register */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
