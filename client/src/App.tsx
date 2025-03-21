import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import FreeKeys from "@/pages/free-keys";
import VipKeys from "@/pages/vip-keys";
import ApiKeys from "@/pages/api-keys";
import UsageStats from "@/pages/usage-stats";
import AccessLogs from "@/pages/access-logs";
import IpTracking from "@/pages/ip-tracking";
import Settings from "@/pages/settings";
import UrlShortener from "@/pages/url-shortener";
import KeyVerified from "@/pages/key-verified";
import AdminLayout from "@/components/layout/admin-layout";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";

function Router() {
  const [location, setLocation] = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAuthenticated(data.authenticated);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated and not on login page, redirect to login
  if (authenticated === false && location !== '/login') {
    setLocation('/login');
    return null;
  }

  // If authenticated and on login page, redirect to dashboard
  if (authenticated === true && location === '/login') {
    setLocation('/');
    return null;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      
      <Route path="/free-keys">
        <AdminLayout>
          <FreeKeys />
        </AdminLayout>
      </Route>
      
      <Route path="/vip-keys">
        <AdminLayout>
          <VipKeys />
        </AdminLayout>
      </Route>
      
      <Route path="/api-keys">
        <AdminLayout>
          <ApiKeys />
        </AdminLayout>
      </Route>
      
      <Route path="/usage-stats">
        <AdminLayout>
          <UsageStats />
        </AdminLayout>
      </Route>
      
      <Route path="/access-logs">
        <AdminLayout>
          <AccessLogs />
        </AdminLayout>
      </Route>
      
      <Route path="/ip-tracking">
        <AdminLayout>
          <IpTracking />
        </AdminLayout>
      </Route>
      
      <Route path="/settings">
        <AdminLayout>
          <Settings />
        </AdminLayout>
      </Route>

      <Route path="/url-shortener">
        <AdminLayout>
          <UrlShortener />
        </AdminLayout>
      </Route>

      {/* Public route for key verification - no authentication required */}
      <Route path="/key-verified">
        <KeyVerified />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
