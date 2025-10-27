import React from 'react';
import { 
  getPositionTypeLabel, 
  getApplicationStageLabel, 
  getStatusLabel,
  getStatusColor,
  getApplicationStageColor,
  getPositionTypeColor
} from '../../utils/enumMappings';

/**
 * Test component to verify enum mappings work correctly
 * with your API response structure
 */
export const EnumMappingTest: React.FC = () => {
  // Mock API response matching your structure
  const mockApiResponse = {
    "id": "6295bf7b-5684-4d34-b319-76ec4fa12e46",
    "applicationNumber": "PMC_APPLICATION_2025_1",
    "firstName": "Hinata",
    "middleName": "Serban",
    "lastName": "Hyuga",
    "positionType": 0,              // Architect
    "submissionDate": "2025-10-13T07:07:04.594084Z",
    "status": 1,                    // Submitted
    "currentStage": 0               // Junior Engineer Pending
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Enum Mapping Test</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">API Response:</h3>
          <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-auto">
            {JSON.stringify(mockApiResponse, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Mapped Values:</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Position Type ({mockApiResponse.positionType}):</span>
              <span className={`px-2 py-1 rounded ${getPositionTypeColor(mockApiResponse.positionType)}`}>
                {getPositionTypeLabel(mockApiResponse.positionType)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Status ({mockApiResponse.status}):</span>
              <span className={`px-2 py-1 rounded ${getStatusColor(mockApiResponse.status)}`}>
                {getStatusLabel(mockApiResponse.status)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Current Stage ({mockApiResponse.currentStage}):</span>
              <span className={`px-2 py-1 rounded ${getApplicationStageColor(mockApiResponse.currentStage)}`}>
                {getApplicationStageLabel(mockApiResponse.currentStage)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">All Position Types:</h3>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3, 4].map(pos => (
              <div key={pos} className="flex justify-between text-sm">
                <span>{pos}:</span>
                <span className={`px-2 py-1 rounded ${getPositionTypeColor(pos)}`}>
                  {getPositionTypeLabel(pos)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">All Application Stages:</h3>
          <div className="grid grid-cols-1 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(stage => (
              <div key={stage} className="flex justify-between text-sm">
                <span>{stage}:</span>
                <span className={`px-2 py-1 rounded ${getApplicationStageColor(stage)}`}>
                  {getApplicationStageLabel(stage)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnumMappingTest;