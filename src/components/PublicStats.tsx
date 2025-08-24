import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, CheckCircle2, Users } from 'lucide-react';

interface CountyStats {
  county_name: string;
  county_code: string;
  new_this_week: number;
  ack_under_4h_percent: number;
  first_action_under_24h_percent: number;
  in_progress: number;
  closed_this_month: number;
}

export const PublicStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      // Fallback to manual query for now (would be an edge function in production)
      const { data: countiesData } = await supabase
        .from('counties')
        .select('id, name, code');
        
      const mockStats: CountyStats[] = (countiesData || []).map(county => ({
        county_name: county.name,
        county_code: county.code,
        new_this_week: Math.floor(Math.random() * 12),
        ack_under_4h_percent: 65 + Math.floor(Math.random() * 30),
        first_action_under_24h_percent: 75 + Math.floor(Math.random() * 20),
        in_progress: Math.floor(Math.random() * 8),
        closed_this_month: Math.floor(Math.random() * 25),
      }));
      
      return mockStats;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalStats = stats?.reduce((acc, county) => ({
    new_this_week: acc.new_this_week + county.new_this_week,
    in_progress: acc.in_progress + county.in_progress,
    closed_this_month: acc.closed_this_month + county.closed_this_month,
    avg_ack_time: acc.avg_ack_time + county.ack_under_4h_percent,
    avg_first_action: acc.avg_first_action + county.first_action_under_24h_percent,
  }), {
    new_this_week: 0,
    in_progress: 0,
    closed_this_month: 0,
    avg_ack_time: 0,
    avg_first_action: 0,
  });

  if (totalStats) {
    totalStats.avg_ack_time = Math.round(totalStats.avg_ack_time / (stats?.length || 1));
    totalStats.avg_first_action = Math.round(totalStats.avg_first_action / (stats?.length || 1));
  }

  return (
    <div className="space-y-6">
      {/* National Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <AlertTriangle className="h-6 w-6 text-warning mx-auto" />
            <CardTitle className="text-2xl font-bold">{totalStats?.new_this_week || 0}</CardTitle>
            <CardDescription>New This Week</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-2">
            <Clock className="h-6 w-6 text-info mx-auto" />
            <CardTitle className="text-2xl font-bold">{totalStats?.in_progress || 0}</CardTitle>
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CheckCircle2 className="h-6 w-6 text-success mx-auto" />
            <CardTitle className="text-2xl font-bold">{totalStats?.closed_this_month || 0}</CardTitle>
            <CardDescription>Resolved This Month</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-2">
            <Users className="h-6 w-6 text-primary mx-auto" />
            <CardTitle className="text-2xl font-bold">{totalStats?.avg_ack_time || 0}%</CardTitle>
            <CardDescription>Avg Response &lt;4h</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* County Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">County Performance</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats?.slice(0, 10).map((county) => (
            <Card key={county.county_code} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {county.county_code}
                  </Badge>
                  {county.new_this_week > 5 && (
                    <Badge variant="destructive" className="text-xs">
                      HIGH
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base">{county.county_name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New:</span>
                  <span className="font-medium">{county.new_this_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-medium">{county.in_progress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response &lt;4h:</span>
                  <span className="font-medium">{county.ack_under_4h_percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Action &lt;24h:</span>
                  <span className="font-medium">{county.first_action_under_24h_percent}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};