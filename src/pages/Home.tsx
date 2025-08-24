import { Link } from 'react-router-dom';
import { Shield, FileText, Users, BarChart3, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { PublicStats } from '@/components/PublicStats';

export default function Home() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Safegal
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A privacy-first platform for reporting and responding to female genital mutilation risks in Kenya. 
              Protecting children through secure, anonymous reporting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              {!user && (
                <>
                  <Link to="/report">
                    <Button size="lg" className="w-full sm:w-auto">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Report a Risk
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <Users className="mr-2 h-5 w-5" />
                      Officer Login
                    </Button>
                  </Link>
                </>
              )}
              
              {user && profile && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {(profile.role === 'teacher' || profile.role === 'guardian') && (
                    <Link to="/report">
                      <Button size="lg">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        File Alert
                      </Button>
                    </Link>
                  )}
                  
                  {(profile.role === 'cpo' || profile.role === 'ngo' || profile.role === 'admin') && (
                    <Link to="/officer">
                      <Button size="lg">
                        <FileText className="mr-2 h-5 w-5" />
                        Case Dashboard
                      </Button>
                    </Link>
                  )}
                  
                  {profile.role === 'admin' && (
                    <Link to="/admin">
                      <Button variant="outline" size="lg">
                        <Users className="mr-2 h-5 w-5" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">This Month in Kenya</h2>
            <p className="text-muted-foreground">Real-time protection statistics across all counties</p>
          </div>
          
          <PublicStats />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  No names or phone numbers stored. All data automatically redacted before saving.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardHeader>
                <Shield className="h-8 w-8 text-secondary mb-2" />
                <CardTitle>Secure Reporting</CardTitle>
                <CardDescription>
                  30-second risk alerts with tamper-evident audit trails and encrypted storage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-colors">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Transparent Impact</CardTitle>
                <CardDescription>
                  Public scoreboard shows response times and outcomes without revealing case details.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Built for Trust</h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-center space-y-2">
                  <Badge variant="secondary" className="text-xs">PRIVACY</Badge>
                  <p className="font-medium">Zero PII Storage</p>
                  <p className="text-sm text-muted-foreground">Names & contacts auto-removed</p>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="text-xs">AUDIT</Badge>
                  <p className="font-medium">Tamper-Evident</p>
                  <p className="text-sm text-muted-foreground">Every action logged permanently</p>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center space-y-2">
                  <Badge className="text-xs">ROLES</Badge>
                  <p className="font-medium">Controlled Access</p>
                  <p className="text-sm text-muted-foreground">Officers see only their county</p>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center space-y-2">
                  <Badge variant="secondary" className="text-xs">OPEN</Badge>
                  <p className="font-medium">Public Stats</p>
                  <p className="text-sm text-muted-foreground">Transparent without case details</p>
                </div>
              </Card>
            </div>
            
            <div className="pt-4">
              <Link to="/trust">
                <Button variant="outline">
                  View Audit Trail
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Safegal Kenya</span>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary">
                Learn More
              </Link>
              <Link to="/public" className="text-sm text-muted-foreground hover:text-primary">
                Public Data
              </Link>
              <Link to="/trust" className="text-sm text-muted-foreground hover:text-primary">
                Trust & Safety
              </Link>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>Powered by privacy-first technology. No personal data stored.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}