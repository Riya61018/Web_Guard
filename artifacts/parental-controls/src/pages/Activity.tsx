import { useListActivity, useListProfiles, getListActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Activity as ActivityIcon, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Activity() {
  const [selectedProfile, setSelectedProfile] = useState<string>("all");
  
  const { data: profiles } = useListProfiles();

  const queryParams = selectedProfile === "all" ? {} : { profileId: Number(selectedProfile) };
  
  const { data: activities, isLoading } = useListActivity(
    queryParams,
    { query: { queryKey: getListActivityQueryKey(queryParams) } }
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-1 text-lg">Monitor all network traffic and blocked events.</p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger data-testid="select-profile-filter">
              <SelectValue placeholder="All Profiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              {profiles?.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Real-time feed of allowed and blocked connections</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : activities?.length === 0 ? (
            <div className="text-center py-16">
              <ActivityIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No activity recorded for this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {activities?.map((activity) => (
                <div key={activity.id} className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${activity.wasBlocked ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                      {activity.wasBlocked ? <ShieldAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-foreground">{activity.domain}</span>
                        {activity.wasBlocked && (
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Blocked</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="font-medium text-foreground/80">{activity.profileName}</span>
                        <span>•</span>
                        <span>{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
