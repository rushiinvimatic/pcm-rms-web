import React from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  getPositionTypeLabel, 
  getApplicationStageLabel, 
  getStatusLabel,
  positionTypeColorConfig,
  applicationStageColorConfig
} from '../../utils/enumMappings';
import type { ApiApplication } from '../../types/dashboard';

interface ApplicationCardProps {
  application: ApiApplication;
  onClick?: () => void;
}

/**
 * ApplicationCard component that demonstrates proper usage of the enum mappings
 * with the API response structure you provided.
 * 
 * Your API response structure:
 * {
 *   "id": "6295bf7b-5684-4d34-b319-76ec4fa12e46",
 *   "applicationNumber": "PMC_APPLICATION_2025_1",
 *   "firstName": "Hinata",
 *   "middleName": "Serban",
 *   "lastName": "Hyuga",
 *   "positionType": 0,          // Maps to PositionType.Architect
 *   "submissionDate": "2025-10-13T07:07:04.594084Z",
 *   "status": 1,                // Maps to status enum (1 = Submitted)
 *   "currentStage": 0           // Maps to ApplicationStage.JUNIOR_ENGINEER_PENDING
 * }
 */
export const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  onClick 
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {application.applicationNumber}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={applicationStageColorConfig[application.currentStage]?.color || 'bg-gray-100 text-gray-800'}>
              {getApplicationStageLabel(application.currentStage)}
            </Badge>
            <Badge className={positionTypeColorConfig[application.positionType]?.color || 'bg-gray-100 text-gray-800'}>
              {getPositionTypeLabel(application.positionType)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Applicant Name</p>
            <p className="text-sm text-gray-900">
              {`${application.firstName} ${application.middleName} ${application.lastName}`.trim()}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Position Type</p>
            <p className="text-sm text-gray-900">
              {getPositionTypeLabel(application.positionType)}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Current Stage</p>
            <p className="text-sm text-gray-900">
              {getApplicationStageLabel(application.currentStage)}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className="text-sm text-gray-900">
              {getStatusLabel(application.status)}
            </p>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Submitted: {new Date(application.submissionDate).toLocaleDateString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">
            ID: {application.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Example usage in your dashboard components:
/*
const YourDashboardComponent: React.FC = () => {
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  
  // Your API call would return data in this format:
  const mockApiResponse = {
    "id": "6295bf7b-5684-4d34-b319-76ec4fa12e46",
    "applicationNumber": "PMC_APPLICATION_2025_1",
    "firstName": "Hinata",
    "middleName": "Serban", 
    "lastName": "Hyuga",
    "positionType": 0,          // Architect 
    "submissionDate": "2025-10-13T07:07:04.594084Z",
    "status": 1,                // Submitted
    "currentStage": 0           // Junior Engineer Pending
  };
  
  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <ApplicationCard 
          key={app.id} 
          application={app}
          onClick={() => handleApplicationClick(app)}
        />
      ))}
    </div>
  );
};
*/