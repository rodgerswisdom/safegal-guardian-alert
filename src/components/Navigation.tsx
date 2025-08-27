import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  FileText, 
  Users, 
  BarChart3, 
  LogOut, 
  User, 
  Settings,
  Home,
  BookOpen,
  Lock,
  Clipboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getDisplayName } from '@/lib/auth/roles';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Safegal</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              // Public navigation
              <>
                <Link to="/public" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>County Stats</span>
                </Link>
                <Link to="/learn" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <BookOpen className="h-4 w-4" />
                  <span>Learn</span>
                </Link>
                <Link to="/report" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Clipboard className="h-4 w-4" />
                  <span>Report</span>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              // Authenticated navigation
              <>
                {profile?.role === 'teacher' || profile?.role === 'guardian' ? (
                  <>
                    <Link to="/report" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <FileText className="h-4 w-4" />
                      <span>Report</span>
                    </Link>
                  </>
                ) : (profile?.role === 'cpo' || profile?.role === 'ngo') ? (
                  <>
                    <Link to="/officer" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <FileText className="h-4 w-4" />
                      <span>Officer Dashboard</span>
                    </Link>
                  </>
                ) : profile?.role === 'admin' ? (
                  <>
                    <Link to="/admin" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </>
                ) : null}
                
                <Link to="/public" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>County Stats</span>
                </Link>
                
                <Link to="/trust" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Lock className="h-4 w-4" />
                  <span>Trust</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu / Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                {profile ? getDisplayName(profile.role) : 'Loading...'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile ? getDisplayName(profile.role) : 'Loading...'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/public" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>County Stats</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/learn" className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Learn</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
