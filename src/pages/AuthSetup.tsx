import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useCreateProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export default function AuthSetup() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  const createProfile = useCreateProfile();
  
  const [role, setRole] = useState<UserRole | ''>('');
  const [countyId, setCountyId] = useState('');
  const [schoolId, setSchoolId] = useState('');

  // Fetch counties and schools
  const { data: counties } = useQuery({
    queryKey: ['counties'],
    queryFn: async () => {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: schools } = useQuery({
    queryKey: ['schools', countyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('county_id', countyId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!countyId,
  });

  // Redirect if already has profile
  if (profile && !profileLoading) {
    return <Navigate to="/" replace />;
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        variant: 'destructive',
        title: 'Please select a role',
      });
      return;
    }

    // Validate required fields based on role
    if ((role === 'teacher' || role === 'guardian') && !schoolId) {
      toast({
        variant: 'destructive',
        title: 'Please select your school',
      });
      return;
    }

    if ((role === 'cpo' || role === 'ngo') && !countyId) {
      toast({
        variant: 'destructive',
        title: 'Please select your county',
      });
      return;
    }

    try {
      await createProfile.mutateAsync({
        role: role as UserRole,
        county_id: countyId || undefined,
        school_id: schoolId || undefined,
      });

      toast({
        title: 'Profile Created',
        description: role === 'teacher' || role === 'guardian' 
          ? 'You can now file reports.'
          : 'Your account is pending admin approval.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create profile',
        description: error.message || 'An error occurred',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Tell us about your role to set up appropriate access and permissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role & Location Setup</CardTitle>
            <CardDescription>
              This information determines your access level and case visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">What is your role?</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <div className="flex-1">
                        <Label htmlFor="teacher" className="font-medium cursor-pointer">
                          Teacher
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          School staff reporting student risk
                        </p>
                      </div>
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="guardian" id="guardian" />
                      <div className="flex-1">
                        <Label htmlFor="guardian" className="font-medium cursor-pointer">
                          Guardian/Parent
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Parent or guardian reporting concerns
                        </p>
                      </div>
                      <Shield className="h-5 w-5 text-secondary" />
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="cpo" id="cpo" />
                      <div className="flex-1">
                        <Label htmlFor="cpo" className="font-medium cursor-pointer">
                          Child Protection Officer
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          County CPO handling cases
                        </p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-accent" />
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="ngo" id="ngo" />
                      <div className="flex-1">
                        <Label htmlFor="ngo" className="font-medium cursor-pointer">
                          NGO Officer
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          NGO staff supporting cases
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* County Selection (for CPO/NGO) */}
              {(role === 'cpo' || role === 'ngo') && (
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Select value={countyId} onValueChange={setCountyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties?.map((county) => (
                        <SelectItem key={county.id} value={county.id}>
                          {county.name} ({county.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* School Selection (for Teachers/Guardians) */}
              {(role === 'teacher' || role === 'guardian') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Select value={countyId} onValueChange={setCountyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the county" />
                      </SelectTrigger>
                      <SelectContent>
                        {counties?.map((county) => (
                          <SelectItem key={county.id} value={county.id}>
                            {county.name} ({county.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {countyId && (
                    <div className="space-y-2">
                      <Label htmlFor="school">School</Label>
                      <Select value={schoolId} onValueChange={setSchoolId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools?.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name} ({school.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Approval Notice */}
              {(role === 'cpo' || role === 'ngo') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Officer accounts require admin approval. You will receive an email notification once your account is activated.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createProfile.isPending}
              >
                {createProfile.isPending ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}