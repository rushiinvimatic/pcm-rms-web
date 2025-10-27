import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { MainHeader } from '../../components/common/MainHeader';
import { Download, Search, FileText, CheckCircle, AlertCircle, User, Calendar, Building } from 'lucide-react';

interface CertificateDetails {
  applicationId: string;
  applicationNumber: string;
  certificateNumber: string;
  applicantName: string;
  position: string;
  issueDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  downloadUrl?: string;
}

export const GuestCertificateDownload: React.FC = () => {
  const [searchType, setSearchType] = useState<'application' | 'certificate'>('application');
  const [searchValue, setSearchValue] = useState('');
  const [certificate, setCertificate] = useState<CertificateDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter an application number or certificate number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setNotFound(false);
    setCertificate(null);

    try {
      // Mock API call - replace with actual certificate search API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock certificate data for demonstration
      const mockCertificate: CertificateDetails = {
        applicationId: '123e4567-e89b-12d3-a456-426614174000',
        applicationNumber: searchType === 'application' ? searchValue : 'PMC/2024/001',
        certificateNumber: searchType === 'certificate' ? searchValue : 'PMC-CERT-2024-001',
        applicantName: 'John Doe',
        position: 'Architect',
        issueDate: '2024-01-25T10:00:00Z',
        validUntil: '2029-01-25T10:00:00Z',
        status: 'ACTIVE',
        downloadUrl: '/api/certificates/download/123e4567-e89b-12d3-a456-426614174000'
      };

      // Simulate not found scenario for certain inputs
      if (searchValue.toLowerCase().includes('notfound') || searchValue.toLowerCase().includes('invalid')) {
        setNotFound(true);
      } else {
        setCertificate(mockCertificate);
      }
    } catch (error) {
      console.error('Error searching certificate:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search for certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    try {
      // Mock download - replace with actual download API
      toast({
        title: "Download Started",
        description: "Certificate download has begun. Please check your downloads folder.",
      });

      // Simulate file download
      const link = document.createElement('a');
      link.href = certificate.downloadUrl || '#';
      link.download = `certificate-${certificate.certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVOKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'EXPIRED':
      case 'REVOKED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Download</h1>
          <p className="mt-2 text-gray-600">
            Search and download professional certificates issued by PMC
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Type Selection */}
              <div>
                <Label className="text-base font-medium">Search by:</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="searchType"
                      value="application"
                      checked={searchType === 'application'}
                      onChange={(e) => setSearchType(e.target.value as 'application')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      Application Number
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="searchType"
                      value="certificate"
                      checked={searchType === 'certificate'}
                      onChange={(e) => setSearchType(e.target.value as 'certificate')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      Certificate Number
                    </span>
                  </label>
                </div>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="searchInput">
                  {searchType === 'application' ? 'Application Number' : 'Certificate Number'}
                </Label>
                <div className="flex space-x-3">
                  <Input
                    id="searchInput"
                    placeholder={
                      searchType === 'application' 
                        ? 'Enter application number (e.g., PMC/2024/001)' 
                        : 'Enter certificate number (e.g., PMC-CERT-2024-001)'
                    }
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Instructions */}
              <div className="text-sm text-gray-600">
                <p className="mb-2">Search instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Application numbers are in format: PMC/YYYY/### (e.g., PMC/2024/001)</li>
                  <li>Certificate numbers are in format: PMC-CERT-YYYY-### (e.g., PMC-CERT-2024-001)</li>
                  <li>Search is case-insensitive</li>
                  <li>Only issued certificates can be downloaded</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {notFound && (
          <Card className="mb-8 border-red-300 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Certificate Not Found</h3>
                <p className="text-red-700">
                  No certificate found with the provided {searchType === 'application' ? 'application' : 'certificate'} number.
                  Please check the number and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {certificate && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  Certificate Details
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(certificate.status)}
                  <Badge className={getStatusColor(certificate.status)}>
                    {certificate.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certificate Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Application Number</p>
                      <p className="font-semibold text-gray-900">{certificate.applicationNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Certificate Number</p>
                      <p className="font-semibold text-gray-900">{certificate.certificateNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Applicant Name</p>
                      <p className="font-semibold text-gray-900">{certificate.applicantName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Professional Position</p>
                      <p className="font-semibold text-gray-900">{certificate.position}</p>
                    </div>
                  </div>
                </div>

                {/* Validity Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Issue Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Valid Until</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(certificate.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      onClick={handleDownload}
                      disabled={certificate.status !== 'ACTIVE'}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {certificate.status === 'ACTIVE' ? 'Download Certificate' : 'Download Not Available'}
                    </Button>
                    
                    {certificate.status !== 'ACTIVE' && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Certificate download is only available for active certificates
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Certificate Validity</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Professional certificates are valid for 5 years from issue date</li>
                  <li>• Expired certificates need to be renewed through proper channels</li>
                  <li>• Revoked certificates are no longer valid for professional practice</li>
                  <li>• Always verify certificate status before relying on it</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Download Guidelines</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Downloaded certificates are in PDF format</li>
                  <li>• Keep multiple copies of your certificate safe</li>
                  <li>• Digital certificates have the same legal validity as physical ones</li>
                  <li>• Contact PMC office for any issues with certificate download</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Need help or have questions?
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Contact PMC office at +91-XXX-XXX-XXXX or email support@pmc.gov.in
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};