import React, { useRef, useState, useEffect } from 'react';
import { Input } from '../../ui/input';

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  value: string;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChange,
  value,
  disabled = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      setOtp(value.split(''));
    }
  }, [value]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const focusNextInput = (index: number) => {
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPreviousInput = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange(otpString);

    if (value !== '') {
      focusNextInput(index);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        focusPreviousInput(index);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .slice(0, length)
      .split('');
    
    if (pastedData.some(x => isNaN(Number(x)))) return;

    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      newOtp[index] = value;
    });
    setOtp(newOtp);
    onChange(newOtp.join(''));
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <div 
            key={index} 
            className="relative group"
          >
            <Input
              ref={el => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{1}"
              maxLength={1}
              value={otp[index]}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={`
                w-14 h-14 text-center text-xl font-semibold rounded-lg
                border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                transition-all duration-300
                ${disabled ? 'bg-gray-100 text-gray-400' : ''}
              `}
              disabled={disabled}
            />
            {/* Active input indicator */}
            <div className={`
              h-0.5 bg-blue-600 absolute bottom-0 left-0 right-0 transform scale-x-0 origin-center
              transition-transform duration-300 ease-out
              ${inputRefs.current[index] === document.activeElement ? 'scale-x-100' : ''}
            `}></div>
          </div>
        ))}
      </div>
  );
};