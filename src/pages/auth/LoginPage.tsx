import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { OTPVerification } from '../../components/common/OTPVerification/OTPVerification';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { MainHeader } from '../../components/common/MainHeader';
import { PMCLogo } from '../../components/common/PMCLogo';
import { cn } from '../../utils/cn';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');

  const handleUserOTPRequest = async (values: { email: string }) => {
    try {
      // Using the updated API endpoint structure
      await authService.requestOTP({
        email: values.email,
        purpose: 'login',
      });
      setEmail(values.email);
      setShowOTP(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: "Please try again later.",
      });
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      // Using the updated API endpoint for OTP verification
      const response = await authService.verifyOTP({
        email,
        otp,
        purpose: 'login',
      });
      
      // Pass user info along with token for proper user object creation
      login(response.token, {
        email: response.user.email,
        role: response.user.role
      });
      
      navigate('/user/dashboard');
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "OTP Verification Failed",
        description: "Invalid or expired OTP. Please try again.",
      });
    }
  };

  const handleOTPResend = async () => {
    try {
      await authService.requestOTP({
        email,
        purpose: 'login',
      });
      toast({
        title: "OTP Resent",
        description: "Please check your email for the new verification code.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to resend OTP",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader variant="auth" />
      
      <div className="flex-1 flex justify-center items-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="mb-2">
                <PMCLogo size="large" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {showOTP ? "Verify OTP" : "Citizen Login"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {showOTP 
                  ? `Enter the verification code sent to ${email}` 
                  : "Login with your email to continue"}
              </p>
            </div>

            {!showOTP ? (
              <div className="animate-fade-in">
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={loginSchema}
                  onSubmit={handleUserOTPRequest}
                >
                  {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Your email address"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cn(
                              "pl-10 transition-all duration-200 border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100",
                              errors.email && touched.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''
                            )}
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        </div>
                        {errors.email && touched.email && (
                          <div className="flex items-center text-red-500 text-sm animate-shake">
                            <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span>{errors.email}</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className={cn(
                          "w-full font-medium transition-all duration-300",
                          isSubmitting ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                        )}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </div>
                        ) : "Continue with Email"}
                      </Button>
                      
                      <div className="text-center text-sm text-gray-600 pt-2">
                        <p>
                          Officer login?{' '}
                          <Link to="/auth/officer-login" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                            Click here
                          </Link>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            ) : (
              <div className="animate-slide-up">
                <OTPVerification
                  email={email}
                  purpose="login"
                  onVerify={handleOTPVerify}
                  onResend={handleOTPResend}
                />
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium hover:underline"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                    </svg>
                    Use a different email
                  </button>
                </div>
              </div>
            )}
            
            {!showOTP && (
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  Log in to access your PMC citizen account.
                  <br />
                  New user? <Link to="/auth/register" className="text-blue-600 hover:underline">Register here</Link>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};