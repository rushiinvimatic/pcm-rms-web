import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  User,
  Building,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface AppointmentData {
  date: string;
  time: string;
  location: string;
  notes: string;
  duration: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  mobileNumber?: string;
  emailAddress?: string;
  submissionDate: string;
}

interface AppointmentSchedulerProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (appointmentData: AppointmentData) => Promise<void>;
  isLoading?: boolean;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  application,
  isOpen,
  onClose,
  onSchedule,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    date: '',
    time: '',
    location: 'PMC Main Office, Room 201',
    notes: '',
    duration: '30'
  });
  const [errors, setErrors] = useState<Partial<AppointmentData>>({});

  // Predefined time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Predefined locations
  const locations = [
    'PMC Main Office, Room 201',
    'PMC Main Office, Room 205',
    'PMC Branch Office, Chinchwad',
    'PMC Branch Office, Pimpri',
    'Engineering Department, Block A'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentData> = {};

    if (!appointmentData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(appointmentData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
      
      // Check if it's a weekend
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newErrors.date = 'Appointments cannot be scheduled on weekends';
      }
    }

    if (!appointmentData.time) {
      newErrors.time = 'Time is required';
    }

    if (!appointmentData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors and try again.",
      });
      return;
    }

    try {
      await onSchedule(appointmentData);
      
      toast({
        title: "Appointment Scheduled",
        description: `Appointment scheduled for ${application.applicantName} on ${new Date(appointmentData.date).toLocaleDateString()} at ${appointmentData.time}.`,
      });
      
      onClose();
      
      // Reset form
      setAppointmentData({
        date: '',
        time: '',
        location: 'PMC Main Office, Room 201',
        notes: '',
        duration: '30'
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        variant: "destructive",
        title: "Scheduling Failed",
        description: "Failed to schedule appointment. Please try again.",
      });
    }
  };

  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    setAppointmentData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Appointment</h2>
              <p className="text-gray-600 text-sm mt-1">
                Schedule document verification appointment
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Application Details */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Application Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">{application.applicationNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">{application.applicantName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">{application.position}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">
                  Submitted: {new Date(application.submissionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Appointment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Appointment Date *</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={errors.date ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.date && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Time Slot *</span>
                </Label>
                <select
                  id="time"
                  value={appointmentData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.time}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Duration (minutes)</span>
              </Label>
              <select
                id="duration"
                value={appointmentData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Location *</span>
              </Label>
              <select
                id="location"
                value={appointmentData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="text-red-600 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.location}</span>
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Additional Notes</span>
              </Label>
              <textarea
                id="notes"
                value={appointmentData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions or documents to bring..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notice</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Applicant will receive email and SMS notification</li>
                    <li>• Please bring all original documents for verification</li>
                    <li>• Appointment can be rescheduled if needed</li>
                    <li>• Late arrivals may need to reschedule</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Scheduling...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};