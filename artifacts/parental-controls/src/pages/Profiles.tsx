import { useListProfiles, useCreateProfile, useDeleteProfile, useUpdateProfile, getListProfilesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Shield, Plus, Settings2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function Profiles() {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useListProfiles();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();
  const updateProfile = useUpdateProfile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    createProfile.mutate({ data: { name: newProfileName } }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewProfileName("");
        queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfile.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
        }
      });
    }
  };

  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateProfile.mutate({ id, data: { isActive: !currentActive } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profiles</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage access and settings for each child.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-profile" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Alex"
                  data-testid="input-profile-name"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!newProfileName.trim() || createProfile.isPending} data-testid="button-submit-profile">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : profiles?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-border/50 shadow-sm">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No profiles yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Create a profile for your child to start managing their online safety.</p>
          <Button onClick={() => setIsCreateOpen(true)} className="mt-6" variant="outline">Create First Profile</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles?.map((profile) => (
            <Card key={profile.id} className="relative overflow-hidden group shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{profile.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {profile.isActive ? "Protection Active" : "Protection Paused"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={profile.isActive}
                      onCheckedChange={() => handleToggleActive(profile.id, profile.isActive)}
                      data-testid={`switch-active-${profile.id}`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 border-t border-border/50 pt-4 flex gap-2">
                <Link href={`/profiles/${profile.id}`}>
                  <Button variant="secondary" className="flex-1 gap-2" data-testid={`link-manage-${profile.id}`}>
                    <Settings2 className="h-4 w-4" />
                    Manage Rules
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-${profile.id}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
