import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import type { Application } from '../../types/dashboard';

interface TaskListProps {
  applications: Application[];
  onViewDetails: (applicationId: string) => void;
  onApprove?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
  onScheduleAppointment?: (applicationId: string) => void;
  onForward?: (applicationId: string) => void;
  onDigitalSign?: (applicationId: string) => void;
  approveButtonLabel?: string;
  isStage2?: boolean;
  loading?: boolean;
  showActions?: boolean;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  applications,
  onViewDetails,
  onApprove,
  onReject,
  onScheduleAppointment,
  onForward,
  onDigitalSign: _onDigitalSign,
  approveButtonLabel = 'Approve',
  isStage2 = false,
  loading = false,
  showActions = true,
  className,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysWaiting = (submittedDate: string) => {
    const diffTime = Date.now() - new Date(submittedDate).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (days: number) => {
    if (days > 7) return 'text-red-600 bg-red-50';
    if (days > 3) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      ASSIGNED_TO_JE: 'bg-yellow-100 text-yellow-800',
      APPOINTMENT_SCHEDULED: 'bg-purple-100 text-purple-800',
      DOCUMENTS_VERIFIED: 'bg-green-100 text-green-800',
      FORWARDED_TO_AE: 'bg-blue-100 text-blue-800',
      PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
      PAYMENT_COMPLETED: 'bg-green-100 text-green-800',
      CERTIFICATE_ISSUED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">No applications found</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {applications.map((application) => {
        const daysWaiting = getDaysWaiting(application.submittedDate || '');
        
        return (
          <div
            key={application.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {application.applicantName}
                  </h3>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    getPriorityColor(daysWaiting)
                  )}>
                    {daysWaiting} days
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Application:</span> {application.applicationNumber}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Position:</span> {application.position}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Submitted:</span> {formatDate(application.submittedDate || '')}
                </p>
                {isStage2 && application.certificatePath && (
                  <p className="text-sm text-blue-600 mt-1">
                    <span className="font-medium">Certificate:</span> {application.certificatePath.split('/').pop() || 'Generated'}
                  </p>
                )}
                {application.appointmentDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Appointment:</span> {formatDate(application.appointmentDate)} at {application.appointmentTime}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  getStatusColor(application.status || '')
                )}>
                  {application.status?.replace(/_/g, ' ') || 'Unknown Status'}
                </span>
                {application.assignedOfficer && (
                  <p className="text-xs text-gray-500">
                    Assigned: {application.assignedOfficer}
                  </p>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(application.id)}
                >
                  View Details
                </Button>
                
                {onScheduleAppointment && application.status === 'ASSIGNED_TO_JE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onScheduleAppointment(application.id)}
                  >
                    Schedule Appointment
                  </Button>
                )}
                
                {onApprove && (
                  <Button
                    size="sm"
                    className={isStage2 ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                    onClick={() => onApprove(application.id)}
                  >
                    {approveButtonLabel}
                  </Button>
                )}
                
                {onReject && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(application.id)}
                  >
                    Reject
                  </Button>
                )}
                
                {onForward && (
                  <Button
                    size="sm"
                    onClick={() => onForward(application.id)}
                  >
                    Forward
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};