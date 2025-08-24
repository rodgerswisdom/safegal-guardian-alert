import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Upload,
  Settings,
  Activity,
  FileText,
  AlertTriangle,
  Map
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface PendingUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch pending user approvals
  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approved', false)
        .in('role', ['cpo', 'ngo'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Fetch system stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      const { count: pendingApprovals } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('approved', false)
        .in('role', ['cpo', 'ngo']);

      return {
        totalUsers: totalUsers || 0,
        totalCases: totalCases || 0,
        pendingApprovals: pendingApprovals || 0,
      };
    },
  });

  const handleApprove = async (userId: string) => {
    // This would be implemented with proper server functions
    console.log(`Approving user ${userId}`);
  };

  const handleDeny = async (userId: string) => {
    // This would be implemented with proper server functions
    console.log(`Denying user ${userId}`);
  };

  const handleUploadSchools = () => {
    // This would be implemented with file upload functionality
    console.log('Upload schools CSV');
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
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">
                System administration and user management
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Administrator
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCases || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Banner */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> This is a simplified admin panel. In production, you would have full administrative capabilities.
          </AlertDescription>
        </Alert>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Approvals ({pendingUsers?.length || 0})</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Officer Approvals</CardTitle>
                <CardDescription>
                  Review and approve new CPO and NGO officer accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers?.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium">Officer Account</div>
                            <div className="text-sm text-muted-foreground">
                              Role: {user.role.toUpperCase()} • Requested: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeny(user.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View All Users
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Roles
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      User Permissions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>County Management</CardTitle>
                  <CardDescription>
                    Assign users to counties and manage coverage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Map className="h-4 w-4 mr-2" />
                      County Assignments
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Schools CSV
                    </Button>
                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      School Management
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    Configure system settings and parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      General Settings
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Performance Monitoring
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage data and system maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Backup & Restore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Administrative Guidelines</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              As an administrator, you have access to all system data and user management functions. 
              Please ensure proper security practices and maintain audit trails for all administrative actions.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>• Review officer applications carefully</span>
              <span>• Maintain data integrity</span>
              <span>• Follow security protocols</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing Map icon - using a placeholder
const Map = ({ className, ...props }: any) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
  </svg>
);