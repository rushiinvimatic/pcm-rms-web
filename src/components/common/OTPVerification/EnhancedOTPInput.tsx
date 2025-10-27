import React, { useRef, useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { cn } from '../../../utils/cn';

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  value: string;
  disabled?: boolean;
}

export const EnhancedOTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChange,
  value,
  disabled = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [activeInput, setActiveInput] = useState<number>(-1);
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      setOtp(value.split('').concat(Array(length - value.length).fill('')));
    } else {
      setOtp(Array(length).fill(''));
    }
  }, [value, length]);

  const focusInput = (index: number) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
      setActiveInput(index);
    }
  };

  const focusNextInput = (index: number) => {
    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const focusPreviousInput = (index: number) => {
    if (index > 0) {
      focusInput(index - 1);
    }
  };

  const handleFocus = (index: number) => {
    setActiveInput(index);
  };

  const handleBlur = () => {
    setActiveInput(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;
    
    // Only allow numbers
    if (inputValue && !/^\d*$/.test(inputValue)) {
      shakeAnimation();
      return;
    }

    const newOtp = [...otp];
    
    // Handle case when a value is pasted into the input
    if (inputValue.length > 1) {
      // Split the input value into an array of characters
      const inputChars = inputValue.split('');
      
      // Update the current input and subsequent inputs
      for (let i = 0; i < inputChars.length && index + i < length; i++) {
        newOtp[index + i] = inputChars[i];
      }
      
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((val, idx) => !val && idx > index);
      if (nextEmptyIndex !== -1) {
        focusInput(nextEmptyIndex);
      } else {
        focusInput(length - 1);
      }
    } else {
      // Single character input
      newOtp[index] = inputValue;
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      if (inputValue !== '') {
        focusNextInput(index);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        focusPreviousInput(index);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPreviousInput(index);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusNextInput(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Allow only numeric input
    if (!/^\d*$/.test(pastedData)) {
      shakeAnimation();
      return;
    }
    
    const pastedChars = pastedData.substring(0, length).split('');
    
    const newOtp = [...otp];
    pastedChars.forEach((char, idx) => {
      newOtp[idx] = char;
    });
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus the next empty input or the last filled input
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    } else {
      focusInput(Math.min(pastedChars.length, length - 1));
    }
  };
  
  const shakeAnimation = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div 
      className={cn(
        "flex gap-3 justify-center",
        isShaking && "animate-shake"
      )}
    >
      {Array(length).fill(0).map((_, index) => (
        <div key={index} className="relative">
          <Input
            ref={el => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            onPaste={index === 0 ? handlePaste : undefined}
            className={cn(
              "w-14 h-14 text-center text-2xl font-semibold rounded-lg",
              "border-2 focus:outline-none transition-all duration-300",
              activeInput === index 
                ? "border-blue-500 bg-blue-50 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]" 
                : "border-gray-200 hover:border-gray-300",
              otp[index] ? "border-green-200" : "",
              disabled && "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
            disabled={disabled}
          />
          
          {/* Bottom indicator line */}
          <div 
            className={cn(
              "h-0.5 bg-blue-500 absolute -bottom-1 left-0 right-0",
              "transform origin-center transition-transform duration-300",
              activeInput === index ? "scale-x-100" : "scale-x-0"
            )}
          />
        </div>
      ))}
    </div>
  );
};