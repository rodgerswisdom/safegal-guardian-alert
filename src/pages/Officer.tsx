import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Users, 
  Phone, 
  Calendar,
  Shield,
  TrendingUp,
  FileText,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { formatTimeAgo, getRiskLevelColor, getRiskLevelText } from '@/lib/utils';

interface Case {
  id: string;
  case_code: string;
  age_band: string;
  county_id: string;
  risk_tags: string[];
  risk_score: number;
  status: string;
  created_at: string;
  is_spike: boolean;
  cpo_acked: boolean;
  ngo_acked: boolean;
}

export default function Officer() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('queue');

  // Fetch cases for the officer's county
  const { data: cases, isLoading } = useQuery({
    queryKey: ['officer-cases', profile?.county_id],
    queryFn: async () => {
      if (!profile?.county_id) return [];
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('county_id', profile.county_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.county_id,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  const queueCases = cases?.filter(c => c.status === 'new') || [];
  const inProgressCases = cases?.filter(c => c.status === 'acknowledged' || c.status === 'in_progress') || [];
  const closedCases = cases?.filter(c => c.status === 'closed' || c.status === 'unfounded') || [];
  const reviewCases = cases?.filter(c => c.status === 'review') || [];

  const handleAction = async (caseId: string, action: string) => {
    // This would be implemented with proper server functions
    console.log(`Action ${action} on case ${caseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Officer Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.role === 'cpo' ? 'Child Protection Officer' : 'NGO Officer'}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {profile?.county_id ? 'County: ' + profile.county_id : 'County not assigned'}
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueCases.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting acknowledgment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCases.length}</div>
              <p className="text-xs text-muted-foreground">
                Being handled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedCases.length}</div>
              <p className="text-xs text-muted-foreground">
                Resolved cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Review</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewCases.length}</div>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Banner */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> This is a simplified dashboard. In production, you would see real case data and be able to perform actions.
          </AlertDescription>
        </Alert>

        {/* Cases Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="queue">Queue ({queueCases.length})</TabsTrigger>
            <TabsTrigger value="progress">In Progress ({inProgressCases.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closedCases.length})</TabsTrigger>
            <TabsTrigger value="review">Review ({reviewCases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <div className="grid gap-4">
              {queueCases.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No new cases in queue</p>
                  </CardContent>
                </Card>
              ) : (
                queueCases.map((caseItem) => (
                  <CaseCard 
                    key={caseItem.id} 
                    caseItem={caseItem} 
                    onAction={handleAction}
                    showActions={true}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid gap-4">
              {inProgressCases.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No cases in progress</p>
                  </CardContent>
                </Card>
              ) : (
                inProgressCases.map((caseItem) => (
                  <CaseCard 
                    key={caseItem.id} 
                    caseItem={caseItem} 
                    onAction={handleAction}
                    showActions={true}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            <div className="grid gap-4">
              {closedCases.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No closed cases</p>
                  </CardContent>
                </Card>
              ) : (
                closedCases.map((caseItem) => (
                  <CaseCard 
                    key={caseItem.id} 
                    caseItem={caseItem} 
                    onAction={handleAction}
                    showActions={false}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="grid gap-4">
              {reviewCases.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No cases under review</p>
                  </CardContent>
                </Card>
              ) : (
                reviewCases.map((caseItem) => (
                  <CaseCard 
                    key={caseItem.id} 
                    caseItem={caseItem} 
                    onAction={handleAction}
                    showActions={true}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Officer Guidelines</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Remember to acknowledge cases promptly, coordinate with other officers, and maintain detailed case notes. 
              All actions are logged in the audit trail for transparency and accountability.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>• Double-acknowledgment required</span>
              <span>• Document all actions taken</span>
              <span>• Coordinate with partner agencies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Case Card Component
function CaseCard({ 
  caseItem, 
  onAction, 
  showActions 
}: { 
  caseItem: Case; 
  onAction: (caseId: string, action: string) => void;
  showActions: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {caseItem.case_code}
            </Badge>
            {caseItem.is_spike && (
              <Badge variant="destructive" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                SPIKE
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getRiskLevelColor(caseItem.risk_score) as any}>
              {getRiskLevelText(caseItem.risk_score)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {caseItem.age_band}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Created {formatTimeAgo(caseItem.created_at)} • Status: {caseItem.status}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Risk Tags</h4>
            <div className="flex flex-wrap gap-1">
              {caseItem.risk_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {showActions && (
            <div className="space-y-2">
              <h4 className="font-medium">Actions</h4>
              <div className="flex flex-wrap gap-2">
                {!caseItem.cpo_acked && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAction(caseItem.id, 'ack_cpo')}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ack (CPO)
                  </Button>
                )}
                {!caseItem.ngo_acked && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAction(caseItem.id, 'ack_ngo')}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ack (NGO)
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAction(caseItem.id, 'call_guardian')}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call Guardian
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAction(caseItem.id, 'school_visit')}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  School Visit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAction(caseItem.id, 'close')}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Close Case
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}