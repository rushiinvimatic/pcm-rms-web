import {
  Building,
  Download,
  Eye,
  User,
  X,
  Award,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getPositionTypeLabel,
  getDocumentTypeLabel
} from '../../utils/enumMappings';
import { Badge } from '../ui/badge';
import type { CertificateInfo } from '../../services/certificate.service';
import { certificateService } from '../../services/certificate.service';
import { CertificateStatus } from '../../types/application';

// Application details interface - matches the structure from JuniorEngineer dashboard
interface ApplicationDetails {
  id: string;
  applicationNumber: string;
  applicantId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  motherName: string;
  mobileNumber: string;
  emailAddress: string;
  positionType: number;
  submissionDate: string;
  bloodGroup: string;
  height: number;
  gender: number;
  permanentAddress: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  currentAddress: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  panCardNumber: string;
  aadharCardNumber: string;
  coaCardNumber: string;
  status: number;
  currentStage: number;
  recommendedFormPath: string;
  documents: {
    id: string;
    documentType: number;
    filePath: string;
    fileName: string;
    fileId: string;
  }[];
}

interface ApplicationFormViewerProps {
  isOpen: boolean;
  application: ApplicationDetails | null;
  onClose: () => void;
  onViewDocument: (filePath: string, fileName: string, isRecommendedForm?: boolean) => void;
  onDownloadDocument: (filePath: string, fileName: string, isRecommendedForm?: boolean) => void;
}

export const ApplicationFormViewer: React.FC<ApplicationFormViewerProps> = ({
  isOpen,
  application,
  onClose,
  onViewDocument,
  onDownloadDocument
}) => {
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  // Fetch certificate information when application changes
  useEffect(() => {
    if (application?.id && isOpen) {
      fetchCertificateInfo();
    }
  }, [application?.id, isOpen]);

  const fetchCertificateInfo = async () => {
    if (!application?.id) return;
    
    setLoadingCertificate(true);
    try {
      const info = await certificateService.getCertificateInfo(application.id);
      setCertificateInfo(info);
    } catch (error) {
      console.error('Error fetching certificate info:', error);
      setCertificateInfo(null);
    } finally {
      setLoadingCertificate(false);
    }
  };

  const handleViewCertificate = () => {
    if (certificateInfo) {
      onViewDocument(
        certificateInfo.certificateUrl || `/certificates/${application?.id}.pdf`,
        `Certificate_${application?.firstName}_${application?.lastName}.pdf`,
        false
      );
    }
  };

  const handleDownloadCertificate = async () => {
    if (!application?.id) return;
    
    try {
      await certificateService.downloadCertificateFile(
        application.id,
        `${application.firstName} ${application.lastName}`
      );
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !application) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {getPositionTypeLabel(application.positionType)}
              </Badge>
              <Badge className={getApplicationStatusColor(application.status)}>
                {getApplicationStatusLabel(application.status)}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Application Number:</strong> {application.applicationNumber}</div>
              <div><strong>Position:</strong> {getPositionTypeLabel(application.positionType)}</div>
              <div><strong>First Name:</strong> {application.firstName}</div>
              <div><strong>Middle Name:</strong> {application.middleName || 'N/A'}</div>
              <div><strong>Last Name:</strong> {application.lastName}</div>
              <div><strong>Mother Name:</strong> {application.motherName}</div>
              <div><strong>Mobile Number:</strong> {application.mobileNumber}</div>
              <div><strong>Email Address:</strong> {application.emailAddress}</div>
              <div><strong>Blood Group:</strong> {application.bloodGroup}</div>
              <div><strong>Height:</strong> {application.height} cm</div>
              <div><strong>Gender:</strong> {application.gender === 0 ? 'Male' : application.gender === 1 ? 'Female' : 'Other'}</div>
              <div><strong>Submission Date:</strong> {formatDate(application.submissionDate)}</div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Address Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Permanent Address</h5>
                <div className="text-sm space-y-1">
                  <div>{application.permanentAddress.addressLine1}</div>
                  {application.permanentAddress.addressLine2 && (
                    <div>{application.permanentAddress.addressLine2}</div>
                  )}
                  {application.permanentAddress.addressLine3 && (
                    <div>{application.permanentAddress.addressLine3}</div>
                  )}
                  <div>{application.permanentAddress.city}, {application.permanentAddress.state}</div>
                  <div>{application.permanentAddress.country} - {application.permanentAddress.pinCode}</div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Current Address</h5>
                <div className="text-sm space-y-1">
                  <div>{application.currentAddress.addressLine1}</div>
                  {application.currentAddress.addressLine2 && (
                    <div>{application.currentAddress.addressLine2}</div>
                  )}
                  {application.currentAddress.addressLine3 && (
                    <div>{application.currentAddress.addressLine3}</div>
                  )}
                  <div>{application.currentAddress.city}, {application.currentAddress.state}</div>
                  <div>{application.currentAddress.country} - {application.currentAddress.pinCode}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3">Document Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div><strong>PAN Number:</strong> {application.panCardNumber}</div>
              <div><strong>Aadhar Number:</strong> {application.aadharCardNumber}</div>
              <div><strong>COA Number:</strong> {application.coaCardNumber}</div>
            </div>
          </div>

          {/* Recommended Form */}
          {application.recommendedFormPath && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">Recommended Form</h4>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDocument(application.recommendedFormPath, 'Recommended Form.pdf', true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => onDownloadDocument(application.recommendedFormPath, 'Recommended Form.pdf', true)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Uploaded Documents */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3">Uploaded Documents</h4>
            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-2">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{getDocumentTypeLabel(doc.documentType)}</div>
                      <div className="text-sm text-gray-600">{doc.fileName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDocument(doc.filePath, doc.fileName)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onDownloadDocument(doc.filePath, doc.fileName)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </div>

          {/* Certificate Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Certificate Status
            </h4>
            
            {loadingCertificate ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading certificate information...</span>
              </div>
            ) : certificateInfo ? (
              <div className="space-y-4">
                {/* Certificate Basic Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Certificate Generated</span>
                    </div>
                    <Badge className={certificateService.getCertificateStatusColor(certificateInfo.status)}>
                      {certificateService.getCertificateStatusLabel(certificateInfo.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Certificate Number:</strong> {certificateInfo.certificateNumber || 'Pending'}</div>
                    <div><strong>Applicant:</strong> {certificateInfo.applicantName}</div>
                    <div><strong>Position:</strong> {certificateInfo.positionType}</div>
                    <div><strong>Issue Date:</strong> {certificateInfo.issueDate ? formatDate(certificateInfo.issueDate) : 'Pending'}</div>
                    {certificateInfo.expiryDate && (
                      <div><strong>Expiry Date:</strong> {formatDate(certificateInfo.expiryDate)}</div>
                    )}
                  </div>

                  {/* Certificate Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleViewCertificate}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Certificate
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownloadCertificate}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                  </div>
                </div>

                {/* Digital Signatures Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Digital Signatures
                  </h5>
                  
                  <div className="space-y-3">
                    {/* Executive Engineer Signature */}
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          certificateInfo.executiveEngineerSignature?.isValid 
                            ? 'bg-green-500' 
                            : certificateInfo.status >= CertificateStatus.EXECUTIVE_ENGINEER_SIGNED
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm font-medium">Executive Engineer</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {certificateInfo.executiveEngineerSignature ? (
                          <div>
                            <div>Signed by: {certificateInfo.executiveEngineerSignature.signedBy}</div>
                            <div>Date: {formatDate(certificateInfo.executiveEngineerSignature.signedDate)}</div>
                          </div>
                        ) : certificateService.isReadyForExecutiveSignature(certificateInfo.status) ? (
                          <span className="text-yellow-600">Pending Signature</span>
                        ) : (
                          <span className="text-gray-500">Not Ready</span>
                        )}
                      </div>
                    </div>

                    {/* City Engineer Signature */}
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          certificateInfo.cityEngineerSignature?.isValid 
                            ? 'bg-green-500' 
                            : certificateInfo.status >= CertificateStatus.CITY_ENGINEER_SIGNED
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm font-medium">City Engineer</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {certificateInfo.cityEngineerSignature ? (
                          <div>
                            <div>Signed by: {certificateInfo.cityEngineerSignature.signedBy}</div>
                            <div>Date: {formatDate(certificateInfo.cityEngineerSignature.signedDate)}</div>
                          </div>
                        ) : certificateService.isReadyForCitySignature(certificateInfo.status) ? (
                          <span className="text-yellow-600">Pending Signature</span>
                        ) : (
                          <span className="text-gray-500">Not Ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Certificate will be available after payment completion</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormViewer;