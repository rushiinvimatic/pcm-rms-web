import React from 'react';
import { getPositionRequirement } from '../../constants/positionRequirements';

interface PositionRequirementsProps {
  positionId: number;
  className?: string;
}

export const PositionRequirements: React.FC<PositionRequirementsProps> = ({ 
  positionId, 
  className = '' 
}) => {
  const requirement = getPositionRequirement(positionId);

  if (!requirement) {
    return null;
  }

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">
          {requirement.name}
        </h3>
        <p className="text-orange-700 font-medium">
          Fees: {requirement.fees}
        </p>
      </div>

      {/* Qualifications */}
      <div className="mb-6">
        <h4 className="font-semibold text-orange-800 mb-3">
          1. Qualifications:
        </h4>
        <ul className="space-y-2">
          {requirement.qualifications.map((qualification, index) => (
            <li key={index} className="text-sm text-orange-700 leading-relaxed">
              {qualification}
            </li>
          ))}
        </ul>
      </div>

      {/* Duties and Responsibilities */}
      <div className="mb-6">
        <h4 className="font-semibold text-orange-800 mb-3">
          2. Duties and Responsibilities of Architects / Licensed Technical Personnel:
        </h4>
        <ul className="space-y-2">
          {requirement.duties.map((duty, index) => (
            <li key={index} className="text-sm text-orange-700 leading-relaxed">
              {duty}
            </li>
          ))}
        </ul>
      </div>

      {/* Required Documents */}
      <div>
        <h4 className="font-semibold text-orange-800 mb-3">
          3. Required Documents for {requirement.name}:
        </h4>
        <ul className="space-y-1">
          {requirement.requiredDocuments.map((document, index) => (
            <li key={index} className="text-sm text-orange-700 leading-relaxed">
              {document}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
