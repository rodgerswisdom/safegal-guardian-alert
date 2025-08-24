import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Users, FileText, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { getAvailableRoles, getDisplayName, getDescription } from '@/lib/auth/roles';
import { getLandingPage } from '@/lib/auth/roles';

export default function AuthSetup() {
  const { user } = useAuth();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const availableRoles = getAvailableRoles();

  // If user already has a role, redirect to appropriate page
  if (profile?.role) {
    const landingPage = getLandingPage(profile.role);
    navigate(landingPage);
    return null;
  }

  const handleRoleSelect = async (role: string) => {
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: role as any,
            approved: role === 'teacher' || role === 'guardian' // Auto-approve reporters
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: role as any,
            approved: role === 'teacher' || role === 'guardian' // Auto-approve reporters
          });

        if (insertError) throw insertError;
      }

      // Refetch profile to get updated data
      await refetchProfile();

      // Redirect based on role
      if (role === 'teacher' || role === 'guardian') {
        navigate('/report');
      } else {
        // For officers, show pending approval message
        setSelectedRole(role);
      }

    } catch (err) {
      console.error('Error setting role:', err);
      setError('Failed to set role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show pending approval for officers
  if (selectedRole && (selectedRole === 'cpo' || selectedRole === 'ngo')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warning/5 via-background to-primary/5 p-4">
        <div className="container mx-auto max-w-2xl py-12">
          <Card className="border-warning/20">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <CardTitle className="text-2xl text-warning">Pending Approval</CardTitle>
              <CardDescription>
                Your account is awaiting administrative approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {getDisplayName(selectedRole as any)}
                </Badge>
                <p className="text-muted-foreground">
                  You've been registered as a {getDisplayName(selectedRole as any).toLowerCase()}. 
                  An administrator will review and approve your account shortly.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">What happens next?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span>Administrator reviews your account</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span>County assignment is configured</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span>You'll receive access to the officer dashboard</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> You can still access public information while waiting for approval. 
                  Check back later or contact your administrator for status updates.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Return Home
                </Button>
                <Button 
                  onClick={() => navigate('/public')}
                  className="flex-1"
                >
                  View County Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container mx-auto max-w-4xl py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold">Welcome to Safegal</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please select your role to complete your account setup. This helps us provide you with the appropriate tools and permissions.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRoles.map((role) => (
            <Card 
              key={role.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {role.value === 'teacher' && <FileText className="h-5 w-5 text-blue-500" />}
                    {role.value === 'guardian' && <Shield className="h-5 w-5 text-green-500" />}
                    {role.value === 'cpo' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    {role.value === 'ngo' && <Users className="h-5 w-5 text-purple-500" />}
                    {role.value === 'admin' && <Shield className="h-5 w-5 text-red-500" />}
                    <CardTitle className="text-lg">{role.label}</CardTitle>
                  </div>
                  {role.value === 'teacher' || role.value === 'guardian' ? (
                    <Badge variant="secondary" className="text-xs">Auto-approved</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Admin approval</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {role.description}
                </CardDescription>
                
                <div className="space-y-2 text-sm">
                  {role.value === 'teacher' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Report incidents from your school</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Track case status updates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Access to school-specific data</span>
                      </div>
                    </>
                  )}
                  
                  {role.value === 'guardian' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Report concerns anonymously</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Receive case reference codes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Privacy-first reporting</span>
                      </div>
                    </>
                  )}
                  
                  {(role.value === 'cpo' || role.value === 'ngo') && (
                    <>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Respond to cases in your county</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Manage case workflow</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Coordinate with other officers</span>
                      </div>
                    </>
                  )}
                  
                  {role.value === 'admin' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Manage user accounts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Configure system settings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Access all data and reports</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            onClick={() => handleRoleSelect(selectedRole)}
            disabled={!selectedRole || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? 'Setting up...' : 'Continue'}
          </Button>
          
          <div className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="mt-12 bg-muted/50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">About Safegal</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium mb-2">Privacy First</h4>
              <p>We never store names or phone numbers. All reports are automatically redacted to protect privacy.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Secure & Anonymous</h4>
              <p>Your identity is protected. Reports are handled confidentially by authorized officers only.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}