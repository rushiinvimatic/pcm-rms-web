import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '../../ui/button';
import { EnhancedOTPInput } from './EnhancedOTPInput';
import { cn } from '../../../utils/cn';

interface OTPVerificationProps {
  email: string;
  purpose: 'login' | 'document' | 'approval';
  onVerify: (otp: string) => void;
  onResend: () => void;
}

const OTP_LENGTH = 6;
const COOLDOWN_PERIOD = 30; // seconds
const OTP_EXPIRY = 5 * 60; // 5 minutes in seconds

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  purpose,
  onVerify,
  onResend,
}) => {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expiryTime, setExpiryTime] = useState(Date.now() + OTP_EXPIRY * 1000);
  const [isLocked, setIsLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let timer: number;

    const updateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiryTime - now);
      
      if (remaining === 0) {
        setIsLocked(true);
        return;
      }

      setTimeRemaining(format(remaining, 'mm:ss'));
      timer = window.setTimeout(updateTimeRemaining, 1000);
    };

    updateTimeRemaining();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [expiryTime]);

  useEffect(() => {
    let cooldownTimer: number;

    if (cooldown > 0) {
      cooldownTimer = window.setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (cooldownTimer) {
        clearInterval(cooldownTimer);
      }
    };
  }, [cooldown]);

  const handleVerify = () => {
    if (otp.length === OTP_LENGTH && !isLocked) {
      setIsVerifying(true);
      
      // Add a slight delay to show verification in progress
      setTimeout(() => {
        onVerify(otp);
        setIsVerifying(false);
      }, 500);
    }
  };

  const handleResend = () => {
    if (cooldown === 0 && !isLocked) {
      onResend();
      setCooldown(COOLDOWN_PERIOD);
      setExpiryTime(Date.now() + OTP_EXPIRY * 1000);
      setIsLocked(false);
      setOtp('');
    }
  };

  // Customize messages based on verification purpose
  const getPurposeMessage = () => {
    switch (purpose) {
      case 'document':
        return 'Document verification';
      case 'approval':
        return 'Application approval';
      case 'login':
      default:
        return 'Authentication';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium text-blue-700">{email}</p>
        <span className="inline-block mt-1 px-2 py-1 bg-blue-50 text-xs text-blue-600 rounded-full">
          {getPurposeMessage()}
        </span>
      </div>

      <div className="py-2">
        <EnhancedOTPInput
          value={otp}
          onChange={setOtp}
          length={OTP_LENGTH}
          disabled={isLocked}
        />
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleVerify}
          disabled={otp.length !== OTP_LENGTH || isLocked || isVerifying}
          className={cn(
            "w-full transition-all duration-300 font-medium",
            otp.length === OTP_LENGTH && !isLocked && !isVerifying
              ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-blue-400"
          )}
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </div>
          ) : "Verify OTP"}
        </Button>

        <Button
          variant="outline"
          onClick={handleResend}
          disabled={cooldown > 0 || isLocked}
          className={cn(
            "w-full border-blue-200 text-blue-700 hover:bg-blue-50",
            (cooldown > 0 || isLocked) && "opacity-50 cursor-not-allowed"
          )}
        >
          {cooldown > 0
            ? `Resend OTP in ${cooldown}s`
            : 'Resend OTP'}
        </Button>
      </div>

      <div className="text-center animate-pulse-slow">
        {isLocked ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600">
            <p className="text-sm font-medium">
              Maximum attempts reached. Please request a new OTP.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
            <div className="flex justify-center items-center text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-gray-700">Time: {timeRemaining}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};