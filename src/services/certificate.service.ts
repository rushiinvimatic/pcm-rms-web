import axios from 'axios';

const API_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5012/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Accept': '*/*',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-access-token'] = token;
  }
  return config;
});

// Certificate Types
export interface CertificateGenerateRequest {
  applicationId: string;
  isPayment: boolean;
  transactionDate: string;
  challanNumber: string;
  amount: number;
}

export interface CertificateInfo {
  applicationId: string;
  certificateNumber?: string;
  applicantName: string;
  positionType: string;
  issueDate?: string;
  expiryDate?: string;
  status: number; // CertificateStatus
  executiveEngineerSignature?: SignatureInfo;
  cityEngineerSignature?: SignatureInfo;
  qrCode?: string;
  certificateUrl?: string;
}

export interface SignatureInfo {
  signedBy: string;
  signedDate: string;
  signatureType: 'EXECUTIVE_ENGINEER' | 'CITY_ENGINEER';
  digitalSignatureHash?: string;
  isValid: boolean;
}

export const CertificateStatus = {
  PENDING_GENERATION: 0,
  GENERATED: 1,
  EXECUTIVE_ENGINEER_SIGNED: 2,
  CITY_ENGINEER_SIGNED: 3,
  COMPLETED: 4,
  EXPIRED: 5,
  CANCELLED: 6
} as const;

export interface CertificateGenerateResponse {
  success: boolean;
  message: string;
  certificateId?: string;
  certificateNumber?: string;
  error?: any;
}

export interface DigitalSignatureRequest {
  applicationId: string;
  signatureType: 'EXECUTIVE_ENGINEER' | 'CITY_ENGINEER';
  comments?: string;
}

export const certificateService = {
  /**
   * Generate SE Certificate after payment completion
   */
  generateSECertificate: async (request: CertificateGenerateRequest): Promise<CertificateGenerateResponse> => {
    try {
      console.log('Generating SE Certificate:', request);
      const response = await api.post('/Certificate/generate-se-certificate', request);
      
      return {
        success: true,
        message: 'Certificate generated successfully',
        certificateId: response.data?.certificateId,
        certificateNumber: response.data?.certificateNumber,
        ...response.data
      };
    } catch (error: any) {
      console.error('Error generating SE certificate:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Certificate generation failed',
        error: error?.response?.data || error
      };
    }
  },

  /**
   * Get certificate information and status
   */
  getCertificateInfo: async (applicationId: string): Promise<CertificateInfo | null> => {
    try {
      console.log('Fetching certificate info for application:', applicationId);
      const response = await api.get(`/Certificate/info/${applicationId}`);
      
      return {
        applicationId,
        certificateNumber: response.data?.certificateNumber,
        applicantName: response.data?.applicantName,
        positionType: response.data?.positionType,
        issueDate: response.data?.issueDate,
        expiryDate: response.data?.expiryDate,
        status: response.data?.status || CertificateStatus.PENDING_GENERATION,
        executiveEngineerSignature: response.data?.executiveEngineerSignature,
        cityEngineerSignature: response.data?.cityEngineerSignature,
        qrCode: response.data?.qrCode,
        certificateUrl: response.data?.certificateUrl,
        ...response.data
      };
    } catch (error: any) {
      console.error('Error fetching certificate info:', error);
      
      // Return null if certificate doesn't exist yet
      if (error?.response?.status === 404) {
        return null;
      }
      
      throw error;
    }
  },

  /**
   * Download certificate as PDF
   */
  downloadCertificate: async (applicationId: string): Promise<Blob> => {
    try {
      console.log('Downloading certificate for application:', applicationId);
      const response = await api.get(`/Certificate/download/${applicationId}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  },

  /**
   * Download certificate file with proper filename
   */
  downloadCertificateFile: async (applicationId: string, applicantName?: string): Promise<void> => {
    try {
      const blob = await certificateService.downloadCertificate(applicationId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = applicantName 
        ? `certificate-${applicantName.replace(/\s+/g, '_')}-${applicationId.slice(-8)}.pdf`
        : `certificate-${applicationId}.pdf`;
        
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate file:', error);
      throw error;
    }
  },

  /**
   * Add Executive Engineer digital signature
   */
  addExecutiveEngineerSignature: async (applicationId: string, comments?: string): Promise<any> => {
    try {
      console.log('Adding Executive Engineer signature for application:', applicationId);
      
      const request: DigitalSignatureRequest = {
        applicationId,
        signatureType: 'EXECUTIVE_ENGINEER',
        comments
      };

      const response = await api.post('/Certificate/add-executive-signature', request);
      
      return {
        success: true,
        message: 'Executive Engineer signature added successfully',
        ...response.data
      };
    } catch (error: any) {
      console.error('Error adding Executive Engineer signature:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Signature addition failed',
        error: error?.response?.data || error
      };
    }
  },

  /**
   * Add City Engineer digital signature
   */
  addCityEngineerSignature: async (applicationId: string, comments?: string): Promise<any> => {
    try {
      console.log('Adding City Engineer signature for application:', applicationId);
      
      const request: DigitalSignatureRequest = {
        applicationId,
        signatureType: 'CITY_ENGINEER',
        comments
      };

      const response = await api.post('/Certificate/add-city-signature', request);
      
      return {
        success: true,
        message: 'City Engineer signature added successfully',
        ...response.data
      };
    } catch (error: any) {
      console.error('Error adding City Engineer signature:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Signature addition failed',
        error: error?.response?.data || error
      };
    }
  },

  /**
   * Get certificate status label
   */
  getCertificateStatusLabel: (status: number): string => {
    const statusLabels: Record<number, string> = {
      [CertificateStatus.PENDING_GENERATION]: 'Pending Generation',
      [CertificateStatus.GENERATED]: 'Generated',
      [CertificateStatus.EXECUTIVE_ENGINEER_SIGNED]: 'Executive Engineer Signed',
      [CertificateStatus.CITY_ENGINEER_SIGNED]: 'City Engineer Signed',
      [CertificateStatus.COMPLETED]: 'Completed',
      [CertificateStatus.EXPIRED]: 'Expired',
      [CertificateStatus.CANCELLED]: 'Cancelled'
    };
    
    return statusLabels[status] || 'Unknown';
  },

  /**
   * Get certificate status color
   */
  getCertificateStatusColor: (status: number): string => {
    const statusColors: Record<number, string> = {
      [CertificateStatus.PENDING_GENERATION]: 'bg-gray-100 text-gray-800',
      [CertificateStatus.GENERATED]: 'bg-blue-100 text-blue-800',
      [CertificateStatus.EXECUTIVE_ENGINEER_SIGNED]: 'bg-yellow-100 text-yellow-800',
      [CertificateStatus.CITY_ENGINEER_SIGNED]: 'bg-purple-100 text-purple-800',
      [CertificateStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [CertificateStatus.EXPIRED]: 'bg-red-100 text-red-800',
      [CertificateStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Check if certificate is ready for Executive Engineer signature
   */
  isReadyForExecutiveSignature: (status: number): boolean => {
    return status === CertificateStatus.GENERATED;
  },

  /**
   * Check if certificate is ready for City Engineer signature
   */
  isReadyForCitySignature: (status: number): boolean => {
    return status === CertificateStatus.EXECUTIVE_ENGINEER_SIGNED;
  },

  /**
   * Check if certificate is completed
   */
  isCertificateCompleted: (status: number): boolean => {
    return status === CertificateStatus.COMPLETED;
  },

  /**
   * Generate mock certificate for testing
   */
  generateMockCertificate: async (applicationId: string): Promise<CertificateInfo> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockCertificate: CertificateInfo = {
      applicationId,
      certificateNumber: `PMC-CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      applicantName: 'Hinata Serban Hyuga',
      positionType: 'Architect',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 5 years
      status: CertificateStatus.GENERATED,
      qrCode: `QR-${applicationId}`,
      certificateUrl: `/certificates/${applicationId}.pdf`
    };

    return mockCertificate;
  },

  /**
   * Add mock Executive Engineer signature
   */
  addMockExecutiveSignature: async (applicationId: string): Promise<SignatureInfo> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Adding mock executive signature for:', applicationId);

    return {
      signedBy: 'Executive Engineer Name',
      signedDate: new Date().toISOString(),
      signatureType: 'EXECUTIVE_ENGINEER',
      digitalSignatureHash: `EE-HASH-${Date.now()}`,
      isValid: true
    };
  },

  /**
   * Add mock City Engineer signature
   */
  addMockCitySignature: async (applicationId: string): Promise<SignatureInfo> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Adding mock city signature for:', applicationId);

    return {
      signedBy: 'City Engineer Name',
      signedDate: new Date().toISOString(),
      signatureType: 'CITY_ENGINEER',
      digitalSignatureHash: `CE-HASH-${Date.now()}`,
      isValid: true
    };
  }
};