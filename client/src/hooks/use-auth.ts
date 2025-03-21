import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current session
  const { 
    data: sessionData, 
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = useQuery({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  const authState: AuthState = {
    user: sessionData?.user || null,
    isAuthenticated: !!sessionData?.authenticated,
    isLoading: isSessionLoading,
    error: sessionError as Error | null,
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Login successful",
        description: "Welcome to THOMAS Admin Dashboard",
      });
      await refetchSession();
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Logout successful",
        description: "You have been logged out of your account",
      });
      // Clear all queries from the cache
      queryClient.clear();
      // Redirect to login page
      setLocation("/login");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    },
  });

  const login = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    ...authState,
    login,
    logout,
    isPendingLogin: loginMutation.isPending,
    isPendingLogout: logoutMutation.isPending,
  };
}

export default useAuth;
