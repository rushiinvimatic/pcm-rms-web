import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { dashboardService } from '../../services/dashboard.service';
import { MainHeader } from '../../components/common/MainHeader';
import { PMCLogo } from '../../components/common/PMCLogo';
import { 
  Download, 
  FileText, 
  Receipt, 
  Award, 
  CheckCircle, 
  Calendar,
  User,
  Building,
  ArrowLeft
} from 'lucide-react';

interface ApplicationData {
  id: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  submissionDate: string;
  completionDate: string;
  status: string;
  certificateNumber?: string;
  paymentAmount?: string;
  paymentDate?: string;
}

interface CertificateDownloadProps {
  email: string;
  applicationNumber: string;
  token: string;
}

export const CertificateDownloadPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const guestData = location.state as CertificateDownloadProps | null;

  useEffect(() => {
    if (!guestData) {
      navigate('/guest/login');
      return;
    }

    fetchApplicationData();
  }, [guestData]);

  const fetchApplicationData = async () => {
    if (!guestData) return;

    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual API when available
      // const response = await dashboardService.getApplicationByNumber(guestData.applicationNumber);
      
      // Mock data for demonstration
      const mockData: ApplicationData = {
        id: '68c3b1271f73fb06b006eb95',
        applicationNumber: guestData.applicationNumber,
        applicantName: 'John Doe',
        position: 'Architect',
        submissionDate: '2025-01-15',
        completionDate: '2025-02-20',
        status: 'CERTIFICATE_ISSUED',
        certificateNumber: 'PMC_CERT_2025_001',
        paymentAmount: '₹5,000',
        paymentDate: '2025-02-10'
      };

      setApplicationData(mockData);
      
    } catch (error) {
      console.error('Error fetching application data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch application data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (fileType: 'certificate' | 'challan' | 'recommended', fileName: string) => {
    if (!applicationData || !guestData) return;

    try {
      setDownloadingFiles(prev => new Set(prev).add(fileType));

      let blob: Blob;
      
      switch (fileType) {
        case 'certificate':
          blob = await dashboardService.downloadCertificate(applicationData.id);
          break;
        case 'challan':
          blob = await dashboardService.downloadChallan(applicationData.id);
          break;
        case 'recommended':
          // Mock API call for recommended form
          blob = new Blob(['Mock recommended form content'], { type: 'application/pdf' });
          break;
        default:
          throw new Error('Invalid file type');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${fileName} is being downloaded.`,
      });

    } catch (error) {
      console.error(`Error downloading ${fileType}:`, error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: `Failed to download ${fileName}. Please try again.`,
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileType);
        return newSet;
      });
    }
  };

  if (!guestData) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainHeader variant="auth" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading application data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainHeader variant="auth" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find an application with the provided details.
            </p>
            <Button
              onClick={() => navigate('/guest/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = {
    CERTIFICATE_ISSUED: { color: 'bg-green-100 text-green-800', label: 'Certificate Issued' },
    PROCESSING: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
    PAYMENT_PENDING: { color: 'bg-orange-100 text-orange-800', label: 'Payment Pending' },
  };

  const downloadableFiles = [
    {
      id: 'certificate',
      name: 'Final Certificate',
      description: 'Official certificate with digital signatures',
      icon: Award,
      fileName: `${applicationData.applicationNumber}_Certificate.pdf`,
      available: applicationData.status === 'CERTIFICATE_ISSUED',
    },
    {
      id: 'recommended',
      name: 'Recommended Form',
      description: 'Initial recommendation document',
      icon: FileText,
      fileName: `${applicationData.applicationNumber}_Recommended_Form.pdf`,
      available: true,
    },
    {
      id: 'challan',
      name: 'Payment Challan',
      description: 'Payment receipt and details',
      icon: Receipt,
      fileName: `${applicationData.applicationNumber}_Challan.pdf`,
      available: !!applicationData.paymentDate,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader variant="auth" />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/guest/login')}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            
            <div className="text-center">
              <PMCLogo className="h-16 w-auto mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Certificate Downloads</h1>
              <p className="text-gray-600 mt-2">Download your official documents</p>
            </div>
          </div>

          {/* Application Summary */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Application Summary</h2>
              <Badge className={statusConfig[applicationData.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                {statusConfig[applicationData.status as keyof typeof statusConfig]?.label || applicationData.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Application Number</p>
                  <p className="font-medium text-gray-900">{applicationData.applicationNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Applicant Name</p>
                  <p className="font-medium text-gray-900">{applicationData.applicantName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium text-gray-900">{applicationData.position}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Submission Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(applicationData.submissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {applicationData.completionDate && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Completion Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(applicationData.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {applicationData.certificateNumber && (
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Certificate Number</p>
                    <p className="font-medium text-gray-900">{applicationData.certificateNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Download Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloadableFiles.map((file) => {
                const IconComponent = file.icon;
                const isDownloading = downloadingFiles.has(file.id);
                
                return (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <IconComponent className="w-6 h-6 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-600">{file.description}</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => downloadFile(file.id as any, file.fileName)}
                      disabled={!file.available || isDownloading}
                      className={`w-full ${
                        file.available 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                      size="sm"
                    >
                      {isDownloading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Downloading...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-2" />
                          {file.available ? 'Download' : 'Not Available'}
                        </div>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {!downloadableFiles.some(file => file.available) && (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                <p className="text-gray-600">
                  Your documents are still being processed. Please check back later.
                </p>
              </div>
            )}
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Having trouble downloading your documents?{' '}
              <Button
                variant="link"
                onClick={() => navigate('/support')}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
              >
                Contact Support
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};