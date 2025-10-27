import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { appointmentService, type ScheduleAppointmentRequest } from '../../services/appointment.service';
import { useToast } from '../../hooks/use-toast';

/**
 * Test component for appointment scheduling API
 */
export const AppointmentSchedulingTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ScheduleAppointmentRequest>({
    model: 'ScheduleAppointmentModel',
    applicationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    comments: 'Test appointment scheduling - Document verification',
    reviewDate: '2025-10-13T12:58:25.860Z',
    contactPerson: 'Junior Engineer - Document Verification Team',
    place: 'PMC Office Building',
    roomNumber: 'Room 101'
  });
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ScheduleAppointmentRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const reviewDateTime = new Date(`${date}T${time}:00`);
      setFormData(prev => ({ ...prev, reviewDate: reviewDateTime.toISOString() }));
    }
  };

  const testScheduleAppointment = async () => {
    try {
      setLoading(true);
      setResponse(null);
      
      console.log('Testing appointment scheduling with:', formData);
      const result = await appointmentService.scheduleAppointment(formData);
      
      setResponse(result);
      console.log('Appointment scheduling result:', result);
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error('Appointment scheduling test error:', error);
      setResponse({ success: false, error: error.message });
      
      toast({
        title: "Error",
        description: error.message || "Failed to schedule appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Scheduling API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                value={formData.applicationId}
                onChange={(e) => handleInputChange('applicationId', e.target.value)}
                placeholder="Enter application ID"
              />
            </div>
            
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="Officer name"
              />
            </div>
            
            <div>
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                value={formData.place}
                onChange={(e) => handleInputChange('place', e.target.value)}
                placeholder="Meeting location"
              />
            </div>
            
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                placeholder="Room number"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const currentTime = formData.reviewDate.split('T')[1];
                  handleDateTimeChange(e.target.value, currentTime?.split('.')[0] || '12:00');
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                onChange={(e) => {
                  const currentDate = formData.reviewDate.split('T')[0];
                  handleDateTimeChange(currentDate, e.target.value);
                }}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="comments">Comments</Label>
            <textarea
              id="comments"
              className="w-full p-3 border border-gray-300 rounded-md mt-1 focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              placeholder="Appointment comments"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              onClick={testScheduleAppointment}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Scheduling...' : 'Test Schedule Appointment'}
            </Button>
            
            <div className="text-sm text-gray-600">
              Review Date: {formData.reviewDate}
            </div>
          </div>
          
          {response && (
            <div className="mt-6">
              <Label>API Response:</Label>
              <pre className="bg-gray-100 p-4 rounded-lg mt-2 overflow-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Your cURL Command Equivalent:</h4>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-auto">
{`curl -X 'POST' \\
  'http://localhost:5012/api/Application/schedule-appointment' \\
  -H 'accept: */*' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(formData, null, 2)}'`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};