/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../../store/useAuthStore";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Get auth state directly from store with proper destructuring
  const { 
    isAuthenticated, 
    user, 
    token, 
    checkAuthState, 
    signIn,
    isLoading: storeLoading 
  } = useAuthStore();

  console.log("🔍 AuthProvider: Current token from store:", {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    isAuthenticated,
    hasUser: !!user,
    storeLoading
  });

  // Listen for token changes and validate if needed
  useEffect(() => {
    // Skip if auth hasn't been checked yet (initial load) or already loading
    if (!authChecked || isLoading) return;

    console.log("🔄 AuthProvider: Token state updated", {
      hasToken: !!token,
      isAuthenticated: isAuthenticated,
      hasUser: !!user,
    });

    // If we have a token but not fully authenticated, validate the token
    if (token && (!isAuthenticated || !user)) {
      console.log("🔍 Validating existing token...");
      setIsLoading(true);
      checkAuthState()
        .then((isValid) => {
          console.log("✅ Token validation result:", isValid);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("❌ Token validation error:", error);
          setIsLoading(false);
        });
    }
  }, [token, isAuthenticated, user, checkAuthState, authChecked, isLoading]);

  // Define routes
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/verification",
    "/forgotpassword",
    "/reset-password",
    "/templates",
    "/portfolio", // Allow portfolio access
  ];
  const authRoutes = [
    "/signin",
    "/signup",
    "/verification",
    "/forgotpassword",
    "/reset-password",
  ];
  const templateInfoRoutes = ["/templates"]; // Allow template info pages for unauthenticated users
  const verificationRoutes = ["/verification"];

  // Initialize auth check
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔄 AuthProvider: Initializing auth check...");
      console.log("🔍 Initial auth state:", {
        hasToken: !!token,
        isAuthenticated,
        hasUser: !!user,
        pathname,
      });

      try {
        // Only check auth state if we have a token
        if (token) {
          console.log("🔍 Token found, validating...", { 
            tokenPreview: token.substring(0, 20) + "...",
            tokenLength: token.length 
          });
          const isValid = await checkAuthState();
          console.log("🔍 Auth check result:", isValid);
          
          if (!isValid) {
            console.log("❌ Token invalid, clearing auth state");
            // Token is invalid, auth store should have cleared it
          } else {
            console.log("✅ Token is valid, user authenticated");
          }
        } else {
          console.log("ℹ️ No token found - user needs to authenticate");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        // Always set these to complete the auth check
        console.log("✅ Auth initialization complete");
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    // Only run if we haven't checked auth yet
    if (!authChecked) {
      initAuth();
    }
  }, [token, checkAuthState, authChecked, isAuthenticated, user, pathname]);

  // Handle redirects after auth is checked
  useEffect(() => {
    if (!authChecked || isLoading) return;

    // Small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      // Check if user is truly authenticated (has all required data)
      const isFullyAuthenticated = isAuthenticated && token && user;

      if (isFullyAuthenticated) {
        // User is authenticated
        if (authRoutes.includes(pathname)) {
          router.replace("/dashboard");
        }
      } else {
        // User is not authenticated
        // Don't redirect from verification page if user has email stored (coming from sign-in)
        if (pathname === "/verification") {
          const storedEmail =
            typeof window !== "undefined"
              ? localStorage.getItem("userEmail")
              : null;
          if (storedEmail) {
            return;
          }
        }

        // Allow unauthenticated users to view template info pages
        if (pathname.startsWith("/templates/")) {
          return;
        }

        // Allow unauthenticated users to preview actual templates
        if (pathname.startsWith("/allTemplates/")) {
          return;
        }

        // Allow unauthenticated users to view portfolios
        if (pathname.startsWith("/portfolio/")) {
          return;
        }

        if (!publicRoutes.includes(pathname)) {
          router.replace("/signin");
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    authChecked,
    isLoading,
    isAuthenticated,
    token,
    user,
    pathname,
    router,
    authRoutes,
    publicRoutes,
  ]);

  // Show loading screen during initialization
  if (!authChecked || isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const contextValue: AuthContextType = {
    isAuthenticated: isAuthenticated && !!token && !!user,
    isLoading,
    user,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
