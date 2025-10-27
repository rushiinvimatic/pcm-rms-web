import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { authService } from '../../services/auth.service';
import { OTPVerification } from '../../components/common/OTPVerification/OTPVerification';
import { MainHeader } from '../../components/common/MainHeader';
import { PMCLogo } from '../../components/common/PMCLogo';
import { Download, FileText, Receipt, Award } from 'lucide-react';

const guestLoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  applicationNumber: Yup.string().required('Application number is required'),
});

interface GuestLoginFormData {
  email: string;
  applicationNumber: string;
}

export const GuestLoginPage: React.FC = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [loginData, setLoginData] = useState<GuestLoginFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGuestLogin = async (values: GuestLoginFormData) => {
    try {
      setIsLoading(true);
      await authService.requestOTP({
        email: values.email,
        purpose: 'document',
      });
      
      setLoginData(values);
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
        description: "Please verify your email and application number.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    if (!loginData) return;

    try {
      setIsLoading(true);
      
      const response = await authService.verifyOTP({
        email: loginData.email,
        otp,
        purpose: 'document',
      });

      // Navigate to certificate download page with application data
      navigate('/guest/certificates', {
        state: {
          email: loginData.email,
          applicationNumber: loginData.applicationNumber,
          token: response.token,
        }
      });
      
      toast({
        title: "Verification Successful",
        description: "You can now download your certificates.",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "OTP Verification Failed",
        description: "Invalid or expired OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPResend = async () => {
    if (!loginData) return;

    try {
      await authService.requestOTP({
        email: loginData.email,
        purpose: 'document',
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

  if (showOTP && loginData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainHeader variant="auth" />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="p-8 shadow-lg">
              <div className="text-center mb-6">
                <PMCLogo className="h-16 w-auto mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
                <p className="text-gray-600 mt-2">
                  We've sent a verification code to {loginData.email}
                </p>
              </div>

              <OTPVerification
                onVerify={handleOTPVerify}
                onResend={handleOTPResend}
                email={loginData.email}
                purpose="document"
              />

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowOTP(false);
                    setLoginData(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back to login
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader variant="auth" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg">
            <div className="text-center mb-6">
              <PMCLogo className="h-16 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Download Certificates</h2>
              <p className="text-gray-600 mt-2">
                Enter your email and application number to download your certificates
              </p>
            </div>

            <Formik
              initialValues={{ email: '', applicationNumber: '' }}
              validationSchema={guestLoginSchema}
              onSubmit={handleGuestLogin}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your registered email"
                        className="transition-all duration-200"
                        disabled={isLoading}
                      />
                      <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicationNumber" className="text-gray-700">Application Number</Label>
                      <Field
                        as={Input}
                        id="applicationNumber"
                        name="applicationNumber"
                        type="text"
                        placeholder="e.g., PMC_APPLICATION_2025_87"
                        className="transition-all duration-200"
                        disabled={isLoading}
                      />
                      <ErrorMessage name="applicationNumber" component="div" className="text-red-600 text-sm" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-all duration-200"
                    disabled={isSubmitting || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending OTP...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Download className="w-4 h-4 mr-2" />
                        Access Certificates
                      </div>
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Available Documents:</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Final Certificate (with digital signatures)
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Recommended Form
                </div>
                <div className="flex items-center">
                  <Receipt className="w-4 h-4 mr-2" />
                  Payment Challan
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <button
                  onClick={() => navigate('/support')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};