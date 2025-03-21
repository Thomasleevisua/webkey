import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { AlertCircle, Clock, Save, Lock, RotateCw, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(true);
  const [cleanupInterval, setCleanupInterval] = useState("24");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (settings) {
      setAutoCleanupEnabled(settings.autoCleanup === "true");
      setCleanupInterval(settings.cleanupInterval || "24");
    }
  }, [settings]);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/password", {
        oldPassword,
        newPassword
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/settings", {
        autoCleanup: autoCleanupEnabled.toString(),
        cleanupInterval: cleanupInterval
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      // Refresh settings
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Run cleanup now mutation
  const runCleanupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/keys/cleanup", {});
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: `Cleanup completed: ${data.cleanedKeys || 0} expired keys updated`,
      });
      // Refresh keys data
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to run cleanup process",
        variant: "destructive",
      });
    },
  });

  // Clear all free keys mutation
  const clearFreeKeysMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/keys/free/all", {});
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: `${data.deletedCount || 0} free keys have been deleted`,
      });
      // Refresh keys data
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear free keys",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    // Validate passwords
    if (!oldPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate();
  };

  const handleSettingsSave = () => {
    if (cleanupInterval && (isNaN(Number(cleanupInterval)) || Number(cleanupInterval) < 1)) {
      toast({
        title: "Validation Error",
        description: "Cleanup interval must be a positive number",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <Skeleton className="h-10 w-full bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </TabsList>
          
          <TabsContent value="general">
            <div className="grid gap-6">
              <Skeleton className="h-64 w-full bg-gray-700" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gray-850 rounded-lg shadow border border-red-500 p-4 text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Settings</h3>
          <p className="text-gray-400">Failed to load system settings. Please try again later.</p>
          <Button 
            className="mt-4 bg-primary" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/settings"] })}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader>
                <CardTitle>Key Management Settings</CardTitle>
                <CardDescription>
                  Configure how free and VIP keys are handled in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoCleanup" className="text-gray-300">
                      Automatic Cleanup of Expired Keys
                    </Label>
                    <Switch
                      id="autoCleanup"
                      checked={autoCleanupEnabled}
                      onCheckedChange={setAutoCleanupEnabled}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Automatically mark expired keys as inactive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleanupInterval" className="text-gray-300">
                    Cleanup Interval (hours)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cleanupInterval"
                      type="number"
                      value={cleanupInterval}
                      onChange={(e) => setCleanupInterval(e.target.value)}
                      min="1"
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={!autoCleanupEnabled}
                    />
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    How often the system should check for and clean up expired keys
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-gray-100"
                  onClick={() => {
                    setAutoCleanupEnabled(true);
                    setCleanupInterval("24");
                  }}
                >
                  Reset to Default
                </Button>
                <Button 
                  className="bg-primary" 
                  onClick={handleSettingsSave}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader>
                <CardTitle>Change Admin Password</CardTitle>
                <CardDescription>
                  Update your administrator account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Confirm new password"
                  />
                </div>

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Passwords do not match
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-primary w-full" 
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance">
          <div className="grid gap-6">
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Perform maintenance tasks on your key management system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <RotateCw className="mr-2 h-5 w-5 text-primary" />
                    Manual Cleanup
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Run a manual cleanup to mark all expired keys as inactive. This is useful if you need to immediately update key statuses.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => runCleanupMutation.mutate()}
                    disabled={runCleanupMutation.isPending}
                  >
                    {runCleanupMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
                        Running Cleanup...
                      </>
                    ) : (
                      "Run Cleanup Now"
                    )}
                  </Button>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-red-900">
                  <h3 className="text-lg font-medium mb-2 flex items-center text-red-500">
                    <Trash className="mr-2 h-5 w-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    These actions are destructive and cannot be undone. Please be careful.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="bg-red-900 hover:bg-red-800"
                      >
                        Clear All Free Keys
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-850 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete all free keys from the system.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={() => clearFreeKeysMutation.mutate()}
                          disabled={clearFreeKeysMutation.isPending}
                        >
                          {clearFreeKeysMutation.isPending ? "Deleting..." : "Yes, Delete All Free Keys"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
