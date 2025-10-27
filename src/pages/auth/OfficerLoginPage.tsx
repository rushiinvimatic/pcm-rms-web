import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { authService } from '../../services/auth.service';
import { MainHeader } from '../../components/common/MainHeader';
import { PMCLogo } from '../../components/common/PMCLogo';
import { cn } from '../../utils/cn';

export const OfficerLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Using the updated API endpoint for officer login (token endpoint)
      const response = await authService.officerLogin(formData);
      console.log('Officer login response:', response);
      
      // Check if login was successful
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Store token and login user with email and role info
      console.log('Logging in with:', { email: response.email, role: response.role });
      login(response.token, { 
        email: response.email, 
        role: response.role 
      });
      
      // Redirect based on role from API response
      const roleRoutes = {
        'Admin': '/officers/admin/dashboard',
        'JuniorEngineer': '/officers/junior-engineer/dashboard',
        'JuniorArchitect': '/officers/junior-architect/dashboard',
        'AssistantEngineer': '/officers/assistant-engineer/dashboard',
        'AssistantArchitect': '/officers/assistant-architect/dashboard',
        'JuniorLicenceEngineer': '/officers/junior-licence-engineer/dashboard',
        'AssistantLicenceEngineer': '/officers/assistant-licence-engineer/dashboard',
        'JuniorStructuralEngineer': '/officers/junior-structural-engineer/dashboard',
        'AssistantStructuralEngineer': '/officers/assistant-structural-engineer/dashboard',
        'JuniorSupervisor1': '/officers/junior-supervisor1/dashboard',
        'AssistantSupervisor1': '/officers/assistant-supervisor1/dashboard',
        'JuniorSupervisor2': '/officers/junior-supervisor2/dashboard',
        'AssistantSupervisor2': '/officers/assistant-supervisor2/dashboard',
        'ExecutiveEngineer': '/officers/executive-engineer/dashboard',
        'CityEngineer': '/officers/city-engineer/dashboard',
        'Clerk': '/officers/clerk/dashboard',
      };
      
      const redirectPath = roleRoutes[response.role as keyof typeof roleRoutes] || '/dashboard';
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath);
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${response.role}`,
      });
    } catch (error) {
      console.error("Error during officer login:", error);
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/officer/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader variant="auth" />
      
      <div className="flex-1 flex justify-center items-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="mb-2">
                <PMCLogo size="large" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Officer Login</h2>
              <p className="text-gray-600 text-sm mt-1">
                Log in with your PMC Officer credentials
              </p>
            </div>

            <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 transition-all duration-200 border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100",
                        loading && "opacity-70"
                      )}
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 transition-all duration-200 border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100",
                        loading && "opacity-70"
                      )}
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  variant="link"
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={handleForgotPassword}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                    </svg>
                    Forgot your password?
                  </span>
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full font-medium transition-all duration-300 mt-2",
                  loading ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                )}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : "Sign in"}
              </Button>
              
              <div className="text-center text-sm text-gray-600 mt-6">
                <p>
                  Citizen login?{' '}
                  <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Click here
                    </span>
                  </Link>
                </p>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                This login is restricted to authorized PMC personnel only.
                <br />
                For any access issues, please contact your department administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};