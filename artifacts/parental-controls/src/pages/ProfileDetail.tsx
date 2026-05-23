import { useGetProfile, useListBlockedSites, useCreateBlockedSite, useDeleteBlockedSite, useUpdateBlockedSite, getListBlockedSitesQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Trash2, ShieldBan, Shield, ArrowLeft, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const CATEGORIES = ["Adult Content", "Social Media", "Gaming", "Violence", "Gambling", "Streaming", "Custom"];

export default function ProfileDetail() {
  const { id } = useParams();
  const profileId = Number(id);
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId);
  const { data: sites, isLoading: sitesLoading } = useListBlockedSites(profileId);
  
  const createSite = useCreateBlockedSite();
  const deleteSite = useDeleteBlockedSite();
  const updateSite = useUpdateBlockedSite();

  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("Custom");
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredSites = useMemo(() => {
    if (!sites) return [];
    if (filterCategory === "All") return sites;
    return sites.filter(site => site.category === filterCategory);
  }, [sites, filterCategory]);

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    createSite.mutate({
      profileId,
      data: { domain, category }
    }, {
      onSuccess: () => {
        setDomain("");
        setCategory("Custom");
        queryClient.invalidateQueries({ queryKey: getListBlockedSitesQueryKey(profileId) });
      }
    });
  };

  const handleDelete = (siteId: number) => {
    deleteSite.mutate({ id: siteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBlockedSitesQueryKey(profileId) });
      }
    });
  };

  const handleToggle = (siteId: number, isEnabled: boolean) => {
    updateSite.mutate({
      id: siteId,
      data: { isEnabled: !isEnabled }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBlockedSitesQueryKey(profileId) });
      }
    });
  };

  if (profileLoading || sitesLoading) {
    return <div className="space-y-8 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[400px] w-full" />
    </div>;
  }

  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/profiles">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Profiles
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {profile.name}'s Rules
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium tracking-wide uppercase">
              {profile.isActive ? "Active" : "Paused"}
            </div>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Configure blocked sites and categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Add New Rule</CardTitle>
              <CardDescription>Block a specific domain</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain</label>
                  <Input 
                    placeholder="e.g. facebook.com" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    data-testid="input-domain"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={!domain.trim() || createSite.isPending} data-testid="button-add-rule">
                  Add Rule
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border/50 min-h-[400px] flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
              <div>
                <CardTitle>Active Rules</CardTitle>
                <CardDescription>Manage domains currently being monitored</CardDescription>
              </div>
              <div className="w-full sm:w-48 flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {filteredSites.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No rules found for this category.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSites.map((site) => (
                    <div key={site.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-md ${site.isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <ShieldBan className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-mono text-sm font-medium text-foreground">{site.domain}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{site.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch 
                          checked={site.isEnabled}
                          onCheckedChange={() => handleToggle(site.id, site.isEnabled)}
                          data-testid={`switch-rule-${site.id}`}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-delete-rule-${site.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
