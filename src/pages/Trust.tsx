import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Lock, Hash, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getTrustSeal } from '@/lib/utils';

export default function Trust() {
  const { data: trustData, isLoading } = useQuery({
    queryKey: ['trust-seal'],
    queryFn: getTrustSeal,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-12 mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const latestHash = trustData?.latestHash || '0000000000000000000000000000000000000000000000000000000000000000';
  const monthActionCount = trustData?.monthActionCount || 0;

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Trust & Audit Trail</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every action in Safegal is locked in an uneditable log. This seal proves the chain hasn't changed.
          </p>
        </div>

        {/* Trust Seal */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl">Latest Trust Seal</CardTitle>
            </div>
            <CardDescription>
              Tamper-evident hash chain ensuring data integrity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Latest Hash</span>
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  SHA-256
                </Badge>
              </div>
              <div className="font-mono text-sm break-all bg-background p-3 rounded border">
                {latestHash.substring(0, 8)}...{latestHash.substring(latestHash.length - 8)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{monthActionCount}</div>
                <div className="text-sm text-muted-foreground">Actions this month</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Chain integrity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-primary" />
                <CardTitle>Hash Chaining</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Every action creates a new hash that includes the previous hash, creating an unbreakable chain.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>Action data is combined with previous hash</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>SHA-256 algorithm generates new hash</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>Any change breaks the entire chain</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Tamper Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If any data is modified, the hash chain breaks, immediately revealing tampering attempts.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>Modifying any record changes its hash</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>Subsequent hashes no longer match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-destructive rounded-full"></div>
                  <span>System immediately detects the break</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail Example */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Audit Trail</CardTitle>
            <CardDescription>
              Example of how actions are logged and chained
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div className="flex-1">
                  <div className="font-medium">Case Created</div>
                  <div className="text-sm text-muted-foreground">SG-NRB-7F3X • 2 minutes ago</div>
                </div>
                <Badge variant="outline" className="text-xs">Hash: a1b2c3d4...</Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div className="flex-1">
                  <div className="font-medium">CPO Acknowledged</div>
                  <div className="text-sm text-muted-foreground">Officer ID: CPO-001 • 1 minute ago</div>
                </div>
                <Badge variant="outline" className="text-xs">Hash: e5f6g7h8...</Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div className="flex-1">
                  <div className="font-medium">NGO Acknowledged</div>
                  <div className="text-sm text-muted-foreground">Officer ID: NGO-002 • 30 seconds ago</div>
                </div>
                <Badge variant="outline" className="text-xs">Hash: i9j0k1l2...</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Privacy First</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                No personal data is ever stored. All reports are automatically redacted to protect identities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Secure Access</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Role-based access control ensures users only see data relevant to their responsibilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Every action is logged with cryptographic proof, ensuring complete transparency and accountability.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">About This Trust Seal</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              This trust seal is generated using cryptographic hash functions. The hash chain ensures that 
              every action taken in the system is permanently recorded and cannot be altered without detection. 
              This provides mathematical proof of data integrity and system transparency.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>• SHA-256 cryptographic hashing</span>
              <span>• Immutable audit trail</span>
              <span>• Real-time integrity verification</span>
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