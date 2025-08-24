import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, Phone, BookOpen, Users, Heart, Info } from 'lucide-react';

export default function Learn() {
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Learn About FGM Prevention</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Understanding the risks, recognizing warning signs, and knowing how to help protect girls from female genital mutilation.
          </p>
        </div>

        {/* Emergency Help */}
        <Alert className="mb-8 border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Emergency?</strong> If someone is in immediate danger, call <strong>1199</strong> or your local emergency services immediately.
          </AlertDescription>
        </Alert>

        {/* Help Lines */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Phone className="h-6 w-6 text-primary" />
              <CardTitle>Emergency Help Lines</CardTitle>
            </div>
            <CardDescription>
              Confidential support and emergency assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">1199</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  National emergency hotline for immediate assistance
                </p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">0800 222 333</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Child protection and welfare support
                </p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">0800 720 186</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Women's rights and protection services
                </p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">0800 222 000</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  General child helpline and support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Signs */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <CardTitle>Warning Signs to Watch For</CardTitle>
              </div>
              <CardDescription>
                Indicators that a girl may be at risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Family Pressure</div>
                    <div className="text-sm text-muted-foreground">
                      Increased pressure from family members, especially older relatives
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Upcoming Ceremonies</div>
                    <div className="text-sm text-muted-foreground">
                      Talk of special ceremonies, rituals, or "becoming a woman"
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Sudden Travel Plans</div>
                    <div className="text-sm text-muted-foreground">
                      Unexpected trips to rural areas or other countries
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Physical Signs</div>
                    <div className="text-sm text-muted-foreground">
                      Pain, difficulty walking, or unusual behavior after travel
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Community Talk</div>
                    <div className="text-sm text-muted-foreground">
                      Rumors or discussions about traditional practices
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <CardTitle>How to Help</CardTitle>
              </div>
              <CardDescription>
                Steps you can take to protect girls at risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="font-medium">Stay Alert</div>
                    <div className="text-sm text-muted-foreground">
                      Pay attention to warning signs and changes in behavior
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="font-medium">Report Concerns</div>
                    <div className="text-sm text-muted-foreground">
                      Use this platform to report risks anonymously and safely
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="font-medium">Seek Support</div>
                    <div className="text-sm text-muted-foreground">
                      Contact helplines for guidance and professional assistance
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <div className="font-medium">Educate Others</div>
                    <div className="text-sm text-muted-foreground">
                      Share information about the risks and legal protections
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <div>
                    <div className="font-medium">Emergency Action</div>
                    <div className="text-sm text-muted-foreground">
                      Call emergency services if immediate danger is suspected
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Information */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Legal Protections</CardTitle>
            </div>
            <CardDescription>
              Understanding the law and your rights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">FGM is Illegal in Kenya</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Female Genital Mutilation Act, 2011</p>
                  <p>• Prohibition of Female Genital Mutilation Act, 2011</p>
                  <p>• Penalties include imprisonment and fines</p>
                  <p>• Protection for girls under 18 years</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Rights</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Right to report concerns anonymously</p>
                  <p>• Protection from retaliation</p>
                  <p>• Access to support services</p>
                  <p>• Legal protection for whistleblowers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Community Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Connect with local organizations and support groups
              </p>
              <Badge variant="outline">Local NGOs</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Educational Materials</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Access educational resources and training materials
              </p>
              <Badge variant="outline">Resources</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Professional Training</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Training programs for professionals and community leaders
              </p>
              <Badge variant="outline">Training</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Important Information</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              This information is provided for educational purposes. If you suspect a girl is at risk, 
              please report it immediately using this platform or contact emergency services.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>• All reports are confidential</span>
              <span>• No personal information stored</span>
              <span>• Professional response guaranteed</span>
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