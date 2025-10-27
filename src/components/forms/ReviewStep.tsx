import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { 
  POSITION_LABELS, 
  GENDER_LABELS, 
  SPECIALIZATION_LABELS,
  type ApplicationFormInput 
} from '../../types/application';

interface ReviewStepProps {
  values: ApplicationFormInput;
}

export const ReviewStep = ({ values }: ReviewStepProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPositionLabel = (positionType: string) => {
    return POSITION_LABELS[parseInt(positionType) as keyof typeof POSITION_LABELS] || 'Not specified';
  };

  const getGenderLabel = (gender: string) => {
    return GENDER_LABELS[parseInt(gender) as keyof typeof GENDER_LABELS] || 'Not specified';
  };

  const getSpecializationLabel = (specialization: string) => {
    return SPECIALIZATION_LABELS[parseInt(specialization) as keyof typeof SPECIALIZATION_LABELS] || 'Not specified';
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Review & Submit</h3>
        <p className="text-gray-600 mt-1">Please review all your information before submitting the application.</p>
      </div>

      {/* Personal Information */}
      <Card className="p-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Position:</span>
            <p className="text-gray-900">{getPositionLabel(values.positionType)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Full Name:</span>
            <p className="text-gray-900">
              {[values.firstName, values.middleName, values.lastName].filter(Boolean).join(' ')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Mother's Name:</span>
            <p className="text-gray-900">{values.motherName || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Mobile Number:</span>
            <p className="text-gray-900">{values.mobileNumber || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Email Address:</span>
            <p className="text-gray-900">{values.emailAddress || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
            <p className="text-gray-900">{formatDate(values.dateOfBirth)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Gender:</span>
            <p className="text-gray-900">{getGenderLabel(values.gender)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Height:</span>
            <p className="text-gray-900">{values.height ? `${values.height} cm` : 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Blood Group:</span>
            <p className="text-gray-900">{values.bloodGroup || 'Not provided'}</p>
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="p-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Permanent Address</h5>
            <div className="text-gray-900 space-y-1">
              <p>{values.permanentAddress.addressLine1}</p>
              {values.permanentAddress.addressLine2 && <p>{values.permanentAddress.addressLine2}</p>}
              {values.permanentAddress.addressLine3 && <p>{values.permanentAddress.addressLine3}</p>}
              <p>{values.permanentAddress.city}, {values.permanentAddress.state}</p>
              <p>{values.permanentAddress.country} - {values.permanentAddress.pinCode}</p>
            </div>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Current Address</h5>
            {values.sameAsPermanent ? (
              <p className="text-gray-600 italic">Same as permanent address</p>
            ) : (
              <div className="text-gray-900 space-y-1">
                <p>{values.currentAddress.addressLine1}</p>
                {values.currentAddress.addressLine2 && <p>{values.currentAddress.addressLine2}</p>}
                {values.currentAddress.addressLine3 && <p>{values.currentAddress.addressLine3}</p>}
                <p>{values.currentAddress.city}, {values.currentAddress.state}</p>
                <p>{values.currentAddress.country} - {values.currentAddress.pinCode}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Document Information */}
      <Card className="p-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Document Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">PAN Card Number:</span>
            <p className="text-gray-900">{values.panCardNumber || 'Not provided'}</p>
            <span className="text-xs text-gray-500">
              {values.panCardFile ? `✓ ${values.panCardFile.name}` : '✗ Not uploaded'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Aadhar Card Number:</span>
            <p className="text-gray-900">{values.aadharCardNumber || 'Not provided'}</p>
            <span className="text-xs text-gray-500">
              {values.aadharCardFile ? `✓ ${values.aadharCardFile.name}` : '✗ Not uploaded'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">COA Certificate Number:</span>
            <p className="text-gray-900">{values.coaCardNumber || 'Not provided'}</p>
            <span className="text-xs text-gray-500">
              {values.coaCertificateFile ? `✓ ${values.coaCertificateFile.name}` : '✗ Not uploaded'}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Profile Picture:</span>
            <p className="text-xs text-gray-500">
              {values.profilePictureFile ? `✓ ${values.profilePictureFile.name}` : '✗ Not uploaded'}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Electricity Bill:</span>
            <p className="text-xs text-gray-500">
              {values.electricityBillFile ? `✓ ${values.electricityBillFile.name}` : '✗ Not uploaded'}
            </p>
          </div>
        </div>
      </Card>

      {/* Educational Qualifications */}
      <Card className="p-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Educational Qualifications</h4>
        {values.qualifications.length === 0 ? (
          <p className="text-gray-600">No qualifications added</p>
        ) : (
          <div className="space-y-4">
            {values.qualifications.map((qualification, index) => (
              <div key={qualification.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-700">Qualification {index + 1}</h5>
                  <Badge variant="outline">{getSpecializationLabel(qualification.specialization)}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Institute:</span>
                    <p className="text-gray-900">{qualification.instituteName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">University:</span>
                    <p className="text-gray-900">{qualification.universityName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Degree:</span>
                    <p className="text-gray-900">{qualification.degreeName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Passing Year:</span>
                    <p className="text-gray-900">{qualification.yearOfPassing}</p>
                  </div>
                </div>
                <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                  <span>{qualification.certificateFile ? `✓ Certificate: ${qualification.certificateFile.name}` : '✗ Certificate not uploaded'}</span>
                  <span>{qualification.marksheetFile ? `✓ Marksheet: ${qualification.marksheetFile.name}` : '✗ Marksheet not uploaded'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Work Experience */}
      <Card className="p-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Work Experience</h4>
        {values.experiences.length === 0 ? (
          <p className="text-gray-600">No work experience added</p>
        ) : (
          <div className="space-y-4">
            {values.experiences.map((experience, index) => (
              <div key={experience.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-700">Experience {index + 1}</h5>
                  <Badge variant="outline">{experience.yearsOfExperience} years</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Company:</span>
                    <p className="text-gray-900">{experience.companyName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Position:</span>
                    <p className="text-gray-900">{experience.position}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <p className="text-gray-900">
                      {formatDate(experience.fromDate)} to {formatDate(experience.toDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span>{experience.certificateFile ? `✓ Certificate: ${experience.certificateFile.name}` : '✗ Certificate not uploaded'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Additional Documents */}
      {values.additionalDocuments.length > 0 && (
        <Card className="p-6">
          <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Additional Documents</h4>
          <div className="space-y-2">
            {values.additionalDocuments.map((doc, index) => (
              <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Document {index + 1}</span>
                <span className="text-xs text-gray-500">
                  {doc.file ? `✓ ${doc.file.name}` : '✗ Not uploaded'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Before Submitting:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Please review all information carefully</li>
          <li>• Ensure all required documents are uploaded</li>
          <li>• Verify that all document numbers match the uploaded files</li>
          <li>• Once submitted, you will not be able to modify the application</li>
          <li>• You will receive a confirmation email after successful submission</li>
        </ul>
      </div>
    </div>
  );
};