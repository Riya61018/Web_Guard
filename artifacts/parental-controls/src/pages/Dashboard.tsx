import { useGetDashboardStats, useListActivity, useListProfiles, getListProfilesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShieldAlert, Globe, Activity as ActivityIcon, ArrowRight, ShieldBan, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } = useListActivity({ limit: 5 });
  const { data: profiles, isLoading: profilesLoading } = useListProfiles();

  if (statsLoading || activityLoading || profilesLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1 text-lg">Your family's safety command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Profiles</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-active-profiles">{stats.activeProfiles}</div>
            <p className="text-xs text-muted-foreground mt-1">of {stats.totalProfiles} total profiles</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Blocked Rules</CardTitle>
            <ShieldAlert className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-blocked-rules">{stats.totalBlockedSites}</div>
            <p className="text-xs text-muted-foreground mt-1">active site blocks</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked in 24h</CardTitle>
            <ActivityIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-blocked-24h">{stats.totalBlocked24h}</div>
            <p className="text-xs text-muted-foreground mt-1">recent prevention events</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Blocked Category</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-top-category">
              {stats.topBlockedCategories[0]?.category || "None"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topBlockedCategories[0]?.count || 0} attempts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border/50 flex flex-col">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest blocked network requests</CardDescription>
              </div>
              <Link href="/activity">
                <Button variant="ghost" size="sm" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {recentActivity?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShieldBan className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No recent blocked activity</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentActivity?.filter(a => a.wasBlocked).slice(0, 5).map(activity => (
                  <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium text-foreground truncate">{activity.domain}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.profileName}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {format(new Date(activity.timestamp), "h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 flex flex-col">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Profile Access</CardTitle>
                <CardDescription>Manage individual child settings</CardDescription>
              </div>
              <Link href="/profiles">
                <Button variant="ghost" size="sm" className="gap-2">
                  Manage <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="divide-y divide-border/50">
              {profiles?.slice(0, 5).map(profile => (
                <div key={profile.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${profile.isActive ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <span className="font-medium text-sm">{profile.name}</span>
                  </div>
                  <Link href={`/profiles/${profile.id}`}>
                    <Button variant="secondary" size="sm" className="h-8 gap-2">
                      <Settings2 className="h-3 w-3" />
                      Rules
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
