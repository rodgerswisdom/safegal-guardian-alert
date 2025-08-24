import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, Lock, Eye, EyeOff, ArrowRight, Phone, Clock } from 'lucide-react';
import { redactText, hasRedactions, getRedactionSummary } from '@/lib/redaction';
import { rateLimit, rankAlert, generateCaseCode } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Report() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ageBand: '',
    county: '',
    schoolCode: '',
    riskTags: [] as string[],
    note: '',
  });
  
  const [showRedactionPreview, setShowRedactionPreview] = useState(false);
  const [showCaseCode, setShowCaseCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const [rateLimitError, setRateLimitError] = useState<string>('');

  const riskTagOptions = [
    { id: 'pressure_at_home', label: 'Pressure from family/home' },
    { id: 'upcoming_ceremony', label: 'Upcoming ceremony or travel' },
    { id: 'travel_plan', label: 'Sudden travel plans' },
    { id: 'injury_signs', label: 'Signs of injury or pain' },
    { id: 'community_rumor', label: 'Community rumors or talk' },
    { id: 'other', label: 'Other concerning signs' },
  ];

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 
    'Kitui', 'Meru', 'Garissa', 'Isiolo', 'Samburu'
  ];

  const redactedNote = formData.note ? redactText(formData.note) : '';
  const hasRedactedContent = hasRedactions(formData.note, redactedNote);

  // Check rate limit on component mount and when user changes
  useEffect(() => {
    if (user) {
      checkRateLimit();
    }
  }, [user]);

  const checkRateLimit = async () => {
    if (!user) return;
    
    try {
      const rateLimitResult = await rateLimit(user.id);
      setRateLimitInfo(rateLimitResult);
      setRateLimitError('');
    } catch (error) {
      console.error('Rate limit check failed:', error);
      setRateLimitError('Unable to check rate limit');
    }
  };

  const handleRiskTagChange = (tagId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      riskTags: checked 
        ? [...prev.riskTags, tagId]
        : prev.riskTags.filter(id => id !== tagId)
    }));
  };

  const handlePreview = () => {
    setShowRedactionPreview(true);
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit a report');
      return;
    }

    // Check rate limit again before submitting
    const rateLimitResult = await rateLimit(user.id);
    if (!rateLimitResult.allowed) {
      setRateLimitError(rateLimitResult.reason || 'Rate limit exceeded');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate risk score
      const riskAssessment = rankAlert({
        ageBand: formData.ageBand,
        riskTags: formData.riskTags,
        redactedNote: redactedNote
      });

      // Generate case code
      const caseCode = generateCaseCode(formData.county.substring(0, 3).toUpperCase());

      // Get user profile for school_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, school_id, county_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Create case (this would be done with proper server functions in production)
      const { error: caseError } = await supabase
        .from('cases')
        .insert({
          case_code: caseCode,
          reporter_id: profile.id,
          age_band: formData.ageBand as '10-12' | '13-15' | '16-17',
          county_id: profile.county_id,
          school_id: profile.school_id,
          risk_tags: formData.riskTags,
          redacted_note: redactedNote,
          risk_score: riskAssessment.score,
          status: 'new'
        });

      if (caseError) throw caseError;

      // Update rate limit
      await supabase
        .from('user_rate_limits')
        .upsert({
          user_id: profile.id,
          alerts_today: (rateLimitResult.alertsToday || 0) + 1,
          last_alert_at: new Date().toISOString()
        });

      setIsSubmitting(false);
      setShowCaseCode(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
      setIsSubmitting(false);
      alert('Failed to submit report. Please try again.');
    }
  };

  if (showCaseCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-primary/5 p-4">
        <div className="container mx-auto max-w-2xl py-12">
          <Card className="border-success/20">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Report Submitted</CardTitle>
              <CardDescription>
                Your report has been securely filed and is now in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <Label className="text-sm text-muted-foreground">Case Reference</Label>
                <div className="text-2xl font-mono font-bold tracking-wider">
                  SG-NAI-7F3X
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">What Happens Next?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span>Officers in your county have been automatically notified</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span>Both CPO and NGO will acknowledge within 4 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span>First protective action within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <span>Regular updates until case is resolved</span>
                  </div>
                </div>
              </div>

              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Emergency?</strong> For immediate danger, call:
                  <br />
                  • Police: 999 or 112
                  <br />
                  • Childline Kenya: 116
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Return Home
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  File Another Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">File Risk Alert</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Report FGM risk concerns quickly and securely. All personal information is automatically removed before storage.
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-success">
              <Lock className="h-4 w-4" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center space-x-1 text-primary">
              <Clock className="h-4 w-4" />
              <span>30 Second Report</span>
            </div>
            <div className="flex items-center space-x-1 text-secondary">
              <Shield className="h-4 w-4" />
              <span>Secure Audit Trail</span>
            </div>
          </div>
        </div>

        {/* Rate Limit Error */}
        {rateLimitError && (
          <Alert className="mb-6 border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>Rate Limit:</strong> {rateLimitError}
            </AlertDescription>
          </Alert>
        )}

        {/* Rate Limit Info */}
        {rateLimitInfo && !rateLimitError && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Rate Limit:</strong> {rateLimitInfo.alertsToday}/3 reports today. 
              {rateLimitInfo.nextAllowedAt && ` Next allowed at ${rateLimitInfo.nextAllowedAt.toLocaleTimeString()}`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>
                  Provide the essential information to help officers assess and respond to the risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age Band */}
                <div className="space-y-2">
                  <Label>Age Band of Child at Risk</Label>
                  <Select value={formData.ageBand} onValueChange={(value) => setFormData(prev => ({...prev, ageBand: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-12">10-12 years</SelectItem>
                      <SelectItem value="13-15">13-15 years</SelectItem>
                      <SelectItem value="16-17">16-17 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* County */}
                <div className="space-y-2">
                  <Label>County</Label>
                  <Select value={formData.county} onValueChange={(value) => setFormData(prev => ({...prev, county: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School Code */}
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input
                    id="schoolCode"
                    value={formData.schoolCode}
                    onChange={(e) => setFormData(prev => ({...prev, schoolCode: e.target.value}))}
                    placeholder="e.g., NRB001"
                  />
                </div>

                {/* Risk Tags */}
                <div className="space-y-4">
                  <Label>Risk Indicators (select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {riskTagOptions.map(tag => (
                      <div key={tag.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          id={tag.id}
                          checked={formData.riskTags.includes(tag.id)}
                          onCheckedChange={(checked) => handleRiskTagChange(tag.id, checked as boolean)}
                        />
                        <Label htmlFor={tag.id} className="cursor-pointer flex-1">
                          {tag.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Note */}
                <div className="space-y-2">
                  <Label htmlFor="note">Additional Details (Optional)</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({...prev, note: e.target.value}))}
                    placeholder="Any additional context that might help officers assess the situation..."
                    rows={4}
                  />
                  {formData.note && (
                    <p className="text-xs text-muted-foreground">
                      Names and phone numbers will be automatically removed before saving
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview/Submit */}
            {!showRedactionPreview ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handlePreview}
                  disabled={!formData.ageBand || !formData.county || !formData.schoolCode}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview & Submit
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Card className="border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <EyeOff className="mr-2 h-5 w-5" />
                    Privacy Preview
                  </CardTitle>
                  <CardDescription>
                    This is how your report will be stored (with personal information removed)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p><strong>Age Band:</strong> {formData.ageBand}</p>
                    <p><strong>County:</strong> {formData.county}</p>
                    <p><strong>School:</strong> {formData.schoolCode}</p>
                    <p><strong>Risk Tags:</strong> {formData.riskTags.join(', ')}</p>
                    {redactedNote && (
                      <div>
                        <p><strong>Note:</strong></p>
                        <p className="font-mono text-sm bg-background p-2 rounded border">
                          {redactedNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {hasRedactedContent && (
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Redactions Applied:</strong> {getRedactionSummary(formData.note, redactedNote).join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Submitting...' : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Confirm & Submit Report
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowRedactionPreview(false)}
                    >
                      Edit Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy First</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Lock className="h-4 w-4 text-success mt-0.5" />
                  <span>Names and phone numbers automatically removed</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5" />
                  <span>Encrypted storage with audit trail</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                  <span>Only authorized officers see reports</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Immediate Danger?</p>
                  <p>Police: <strong>999</strong> or <strong>112</strong></p>
                </div>
                <div>
                  <p className="font-medium">Child Support</p>
                  <p>Childline Kenya: <strong>116</strong></p>
                </div>
                <div>
                  <p className="font-medium">Gender-Based Violence</p>
                  <p>GBV Hotline: <strong>1195</strong></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <Badge variant="outline">3 reports / 24 hours</Badge>
                <p className="text-muted-foreground">
                  Maximum 3 reports per user per day to prevent spam
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}