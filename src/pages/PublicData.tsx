import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, CheckCircle2, Users, TrendingUp, Shield } from 'lucide-react';
import { getPublicStats } from '@/lib/utils';

interface CountyStats {
  county_name: string;
  county_code: string;
  new_this_week: number;
  ack_under_4h_percent: number;
  first_action_under_24h_percent: number;
  in_progress: number;
  closed_this_month: number;
}

export default function PublicData() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: getPublicStats,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
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
        </div>
      </div>
    );
  }

  const totalStats = stats?.reduce((acc, county) => ({
    new_this_week: acc.new_this_week + county.new_this_week,
    in_progress: acc.in_progress + county.in_progress,
    closed_this_month: acc.closed_this_month + county.closed_this_month,
  }), { new_this_week: 0, in_progress: 0, closed_this_month: 0 }) || { new_this_week: 0, in_progress: 0, closed_this_month: 0 };

  const avgAckTime = stats?.reduce((sum, county) => sum + county.ack_under_4h_percent, 0) / (stats?.length || 1) || 0;
  const avgActionTime = stats?.reduce((sum, county) => sum + county.first_action_under_24h_percent, 0) / (stats?.length || 1) || 0;

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-3xl font-bold">County Performance Scoreboard</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-time protection statistics across all counties. See how quickly officers respond to alerts and track community safety metrics.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Alerts (7d)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.new_this_week}</div>
              <p className="text-xs text-muted-foreground">
                Across all counties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response &lt;4h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAckTime.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average acknowledgment rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action &lt;24h</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgActionTime.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average first action rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.in_progress}</div>
              <p className="text-xs text-muted-foreground">
                Currently being handled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* County Breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">County Performance</h2>
            <Badge variant="outline" className="text-sm">
              Updated every 5 minutes
            </Badge>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats?.map((county) => (
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
                    <span className={`font-medium ${
                      county.ack_under_4h_percent >= 80 ? 'text-green-600' :
                      county.ack_under_4h_percent >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {county.ack_under_4h_percent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action &lt;24h:</span>
                    <span className={`font-medium ${
                      county.first_action_under_24h_percent >= 80 ? 'text-green-600' :
                      county.first_action_under_24h_percent >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {county.first_action_under_24h_percent}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Privacy & Transparency</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              No personal details are ever shown. These statistics represent aggregate data only. 
              Every action is logged in our tamper-evident audit trail to ensure accountability and transparency.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>• No names or phone numbers stored</span>
              <span>• All reports automatically redacted</span>
              <span>• Audit trail for every action</span>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h4 className="font-semibold text-destructive">Emergency?</h4>
              <p className="text-sm text-muted-foreground">
                If someone is in immediate danger, call <strong>1199</strong> or your local emergency services immediately. 
                This platform does not replace emergency response services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}