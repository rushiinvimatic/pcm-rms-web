import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ApplicationFormViewer } from './ApplicationFormViewer';
import DigitalSignatureModal from './DigitalSignatureModal';
import { certificateService, type CertificateInfo } from '../../services/certificate.service';
import { CertificateStatus } from '../../types/application';
import { Eye, PenTool, CheckCircle, Clock, Award, Download } from 'lucide-react';

interface Application {
  id: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  positionType: number;
  status: string | number;
  submittedDate: string;
  lastUpdated: string;
  assignedOfficer: string;
  paymentStatus?: string;
  certificateNumber?: string;
}

interface Stage2CertificateTabProps {
  applications: Application[];
  userRole: 'EXECUTIVE_ENGINEER' | 'CITY_ENGINEER';
  onApplicationUpdate: (updatedApplication: Application) => void;
  onViewDocument?: (url: string, name: string) => void;
  onDownloadDocument?: (url: string, name: string) => void;
}

export const Stage2CertificateTab: React.FC<Stage2CertificateTabProps> = ({
  applications,
  userRole,
  onApplicationUpdate,
  onViewDocument,
  onDownloadDocument
}) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState<Record<string, boolean>>({});
  const [certificateInfoCache, setCertificateInfoCache] = useState<Record<string, CertificateInfo | null>>({});

  // Filter applications based on role and certificate status
  const getFilteredApplications = () => {
    return applications.filter(app => {
      // Convert status to number if it's a string, or check for string statuses
      let statusNum: number;
      if (typeof app.status === 'string') {
        // Handle string statuses from mock data
        if (app.status === 'PENDING_EXECUTIVE_SIGNATURE') statusNum = 13;
        else if (app.status === 'PENDING_CITY_SIGNATURE') statusNum = 14;
        else statusNum = parseInt(app.status) || 0;
      } else {
        statusNum = app.status;
      }
      
      // Applications should be in Stage 2 (after payment completion)
      // Status 12: PaymentCompleted, 13: ClerkApproved, 14: DigitallySignedByExecutive, 15: DigitallySignedByCity, 16: Completed
      const isInStage2 = statusNum >= 12 && statusNum <= 16;
      
      if (!isInStage2) return false;

      // Check certificate info if available
      const certInfo = certificateInfoCache[app.id];
      
      if (userRole === 'EXECUTIVE_ENGINEER') {
        // Show applications that need executive signature
        // Status 12 (PaymentCompleted) or 13 (ClerkApproved) = ready for executive signature
        if (statusNum === 12 || statusNum === 13) return true;
        
        // If we have cert info, check if ready for executive signature
        if (certInfo) {
          return certificateService.isReadyForExecutiveSignature(certInfo.status) ||
                 certInfo.status === CertificateStatus.EXECUTIVE_ENGINEER_SIGNED;
        }
        
        return statusNum === 12 || statusNum === 13; // Default for apps without cert info yet
      } else {
        // Show applications that need city engineer signature
        // Status 14 (DigitallySignedByExecutive) = ready for city signature
        if (statusNum === 14) return true;
        
        // If we have cert info, check if ready for city signature
        if (certInfo) {
          return certificateService.isReadyForCitySignature(certInfo.status) ||
                 certInfo.status === CertificateStatus.CITY_ENGINEER_SIGNED ||
                 certInfo.status === CertificateStatus.COMPLETED;
        }
        
        return statusNum === 14 || statusNum === 15 || statusNum === 16; // Default for apps without cert info yet
      }
    });
  };

  // Load certificate info for an application
  const loadCertificateInfo = async (applicationId: string) => {
    if (loadingCertificates[applicationId] || certificateInfoCache[applicationId]) return;

    setLoadingCertificates(prev => ({ ...prev, [applicationId]: true }));
    
    try {
      const certInfo = await certificateService.getCertificateInfo(applicationId);
      setCertificateInfoCache(prev => ({ ...prev, [applicationId]: certInfo }));
    } catch (error) {
      console.error(`Failed to load certificate info for ${applicationId}:`, error);
      setCertificateInfoCache(prev => ({ ...prev, [applicationId]: null }));
    } finally {
      setLoadingCertificates(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Load certificate info for all Stage 2 applications on mount
  useEffect(() => {
    getFilteredApplications().forEach(app => {
      if (!certificateInfoCache[app.id] && !loadingCertificates[app.id]) {
        loadCertificateInfo(app.id);
      }
    });
  }, [applications]);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationViewer(true);
  };

  const handleAddSignature = (application: Application) => {
    const certInfo = certificateInfoCache[application.id];
    setSelectedApplication(application);
    setCertificateInfo(certInfo);
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = () => {
    if (selectedApplication) {
      // Reload certificate info to get updated status
      loadCertificateInfo(selectedApplication.id);
      
      // Update application status
      onApplicationUpdate({
        ...selectedApplication,
        status: userRole === 'EXECUTIVE_ENGINEER' ? 'EXECUTIVE_SIGNED' : 'CITY_SIGNED',
        lastUpdated: new Date().toISOString()
      });
    }
    setShowSignatureModal(false);
  };

  const handleDownloadCertificate = async (application: Application) => {
    try {
      await certificateService.downloadCertificateFile(
        application.id,
        application.applicantName
      );
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const getCertificateStatusBadge = (certInfo: CertificateInfo | null) => {
    if (!certInfo) {
      return <Badge className="bg-gray-100 text-gray-800">Loading...</Badge>;
    }

    return (
      <Badge className={certificateService.getCertificateStatusColor(certInfo.status)}>
        {certificateService.getCertificateStatusLabel(certInfo.status)}
      </Badge>
    );
  };

  const getActionButtons = (application: Application, certInfo: CertificateInfo | null) => {
    if (!certInfo) return null;

    const canSign = userRole === 'EXECUTIVE_ENGINEER' 
      ? certificateService.isReadyForExecutiveSignature(certInfo.status)
      : certificateService.isReadyForCitySignature(certInfo.status);

    const hasSignature = userRole === 'EXECUTIVE_ENGINEER'
      ? certInfo.executiveEngineerSignature?.isValid
      : certInfo.cityEngineerSignature?.isValid;

    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewApplication(application)}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownloadCertificate(application)}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Certificate
        </Button>

        {canSign && !hasSignature && (
          <Button
            size="sm"
            onClick={() => handleAddSignature(application)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <PenTool className="h-4 w-4" />
            Sign
          </Button>
        )}

        {hasSignature && (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-green-600 border-green-200"
            disabled
          >
            <CheckCircle className="h-4 w-4" />
            Signed
          </Button>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = getFilteredApplications();

  if (filteredApplications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Ready</h3>
        <p className="text-gray-600">
          {userRole === 'EXECUTIVE_ENGINEER' 
            ? 'No certificates are ready for Executive Engineer signature at this time.'
            : 'No certificates are ready for City Engineer signature at this time.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">
              Stage 2 - Certificate Digital Signature
            </h3>
            <p className="text-sm text-blue-700">
              {userRole === 'EXECUTIVE_ENGINEER' 
                ? 'Review and digitally sign certificates as Executive Engineer'
                : 'Review and digitally sign certificates as City Engineer'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Certificates Pending Signature ({filteredApplications.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredApplications.map((application) => {
            const certInfo = certificateInfoCache[application.id];
            const isLoading = loadingCertificates[application.id];

            return (
              <div key={application.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {application.applicationNumber}
                      </h4>
                      {getCertificateStatusBadge(certInfo)}
                      {certInfo?.certificateNumber && (
                        <span className="text-sm text-gray-600">
                          Cert: {certInfo.certificateNumber}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applicant:</span> {application.applicantName}
                      </div>
                      <div>
                        <span className="font-medium">Position:</span> {application.position}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {formatDate(application.lastUpdated)}
                      </div>
                    </div>

                    {/* Signature Status */}
                    {certInfo && (
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {certInfo.executiveEngineerSignature?.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">Executive Engineer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {certInfo.cityEngineerSignature?.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">City Engineer</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        Loading...
                      </div>
                    ) : (
                      getActionButtons(application, certInfo)
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Viewer Modal */}
      {selectedApplication && (
        <ApplicationFormViewer
          isOpen={showApplicationViewer}
          application={selectedApplication as any} // Type conversion for compatibility
          onClose={() => setShowApplicationViewer(false)}
          onViewDocument={onViewDocument || (() => {})}
          onDownloadDocument={onDownloadDocument || (() => {})}
        />
      )}

      {/* Digital Signature Modal */}
      {selectedApplication && certificateInfo && (
        <DigitalSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          applicationId={selectedApplication.id}
          applicantName={selectedApplication.applicantName}
          certificateInfo={certificateInfo}
          userRole={userRole}
          onSignatureComplete={handleSignatureComplete}
        />
      )}
    </div>
  );
};

export default Stage2CertificateTab;