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

  // Get auth state directly from store
  const authState = useAuthStore();
  const { isAuthenticated, user, token, checkAuthState, signIn } = authState;

  // Listen for token changes (but not on initial load)
  useEffect(() => {
    // Skip if auth hasn't been checked yet (initial load)
    if (!authChecked) return;

    console.log("🔄 AuthProvider: Token state updated", {
      hasToken: !!token,
      isAuthenticated: isAuthenticated,
    });

    // If we have a token but not authenticated, validate the token
    if (token && !isAuthenticated) {
      setIsLoading(true);
      checkAuthState()
        .then((isValid) => {
          if (isValid) {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("❌ Token validation error:", error);
          setIsLoading(false);
        });
    }
  }, [token, isAuthenticated, checkAuthState, authChecked]);

  // Define routes
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/verification",
    "/forgotpassword",
    "/reset-password",
    "/templates",
    "/portfolio",  // Allow portfolio access to unauthenticated users
    "/allTemplates", // Allow template previews
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
      console.log('🔄 AuthProvider: Initializing auth check...');
      console.log('🔍 Initial auth state:', { 
        hasToken: !!token, 
        isAuthenticated, 
        hasUser: !!user, 
        pathname 
      });

      try {
        if (token) {
          console.log('✅ Token found, calling checkAuthState');
          await checkAuthState();
        } else {
          console.log('❌ No token found - setting auth as checked for public access');
          // No token means user is not authenticated, but we should still allow public routes
          setIsLoading(false);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // On error, still mark auth as checked to prevent infinite loading
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []); // Only run once on mount

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
