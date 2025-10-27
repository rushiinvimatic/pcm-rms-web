import axios from 'axios';
import type { 
  ApplicationFormData, 
  ApplicationFormInput
} from '../types/application';
import { DocumentType } from '../types/application';

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

export const applicationService = {
  /**
   * Transform form input data to API format and upload files
   */
  transformAndUploadData: async (formData: ApplicationFormInput): Promise<ApplicationFormData> => {
    // Use pre-uploaded file IDs - files should already be uploaded when selected
    const documents = [];

    // Add personal documents using pre-uploaded file IDs
    if (formData.panCardFileId) {
      documents.push({
        documentType: DocumentType.PanCard,
        filePath: formData.panCardFileId,
        fileName: formData.panCardFileName || 'PAN Card',
        fileId: formData.panCardFileId
      });
    }

    if (formData.aadharCardFileId) {
      documents.push({
        documentType: DocumentType.AadharCard,
        filePath: formData.aadharCardFileId,
        fileName: formData.aadharCardFileName || 'Aadhar Card',
        fileId: formData.aadharCardFileId
      });
    }

    if (formData.coaCertificateFileId) {
      documents.push({
        documentType: DocumentType.CoaCertificate,
        filePath: formData.coaCertificateFileId,
        fileName: formData.coaCertificateFileName || 'COA Certificate',
        fileId: formData.coaCertificateFileId
      });
    }

    if (formData.profilePictureFileId) {
      documents.push({
        documentType: DocumentType.ProfilePicture,
        filePath: formData.profilePictureFileId,
        fileName: formData.profilePictureFileName || 'Profile Picture',
        fileId: formData.profilePictureFileId
      });
    }

    if (formData.electricityBillFileId) {
      documents.push({
        documentType: DocumentType.ElectricityBill,
        filePath: formData.electricityBillFileId,
        fileName: formData.electricityBillFileName || 'Electricity Bill',
        fileId: formData.electricityBillFileId
      });
    }

    // Use pre-uploaded qualification file IDs
    const qualifications = [];
    for (const qualification of formData.qualifications) {
      let certificateFileId = qualification.certificateFileId || '';
      let marksheetFileId = qualification.marksheetFileId || '';

      if (certificateFileId) {
        documents.push({
          documentType: DocumentType.DegreeCertificate,
          filePath: certificateFileId,
          fileName: qualification.certificateFileName || 'Degree Certificate',
          fileId: certificateFileId
        });
      }

      if (marksheetFileId) {
        documents.push({
          documentType: DocumentType.DegreeMarksheet,
          filePath: marksheetFileId,
          fileName: qualification.marksheetFileName || 'Degree Marksheet',
          fileId: marksheetFileId
        });
      }

      // Create date from year and month
      const passingDate = new Date(
        parseInt(qualification.yearOfPassing),
        parseInt(qualification.passingMonth) - 1,
        1
      ).toISOString();

      qualifications.push({
        fileId: certificateFileId, // Main certificate file ID
        instituteName: qualification.instituteName,
        universityName: qualification.universityName,
        specialization: parseInt(qualification.specialization),
        degreeName: qualification.degreeName,
        passingMonth: parseInt(qualification.passingMonth),
        yearOfPassing: passingDate
      });
    }

    // Use pre-uploaded experience file IDs
    const experiences = [];
    for (const experience of formData.experiences) {
      let certificateFileId = experience.certificateFileId || '';

      if (certificateFileId) {
        documents.push({
          documentType: DocumentType.ExperienceCertificate,
          filePath: certificateFileId,
          fileName: experience.certificateFileName || 'Experience Certificate',
          fileId: certificateFileId
        });
      }

      experiences.push({
        fileId: certificateFileId,
        companyName: experience.companyName,
        position: experience.position,
        yearsOfExperience: Math.round(parseFloat(experience.yearsOfExperience)),
        fromDate: new Date(experience.fromDate).toISOString(),
        toDate: new Date(experience.toDate).toISOString()
      });
    }

    // Use pre-uploaded additional document file IDs
    for (const additionalDoc of formData.additionalDocuments) {
      if (additionalDoc.fileId) {
        documents.push({
          documentType: parseInt(additionalDoc.documentType),
          filePath: additionalDoc.fileId,
          fileName: additionalDoc.fileName || 'Additional Document',
          fileId: additionalDoc.fileId
        });
      }
    }

    // Transform the main form data
    const apiData: ApplicationFormData = {
      model: '', // Required by API
      firstName: formData.firstName,
      middleName: formData.middleName || '',
      lastName: formData.lastName,
      motherName: formData.motherName,
      mobileNumber: formData.mobileNumber,
      emailAddress: formData.emailAddress,
      positionType: parseInt(formData.positionType),
      bloodGroup: formData.bloodGroup,
      height: parseFloat(formData.height),
      gender: parseInt(formData.gender),
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      permanentAddress: formData.permanentAddress,
      currentAddress: formData.sameAsPermanent ? formData.permanentAddress : formData.currentAddress,
      panCardNumber: formData.panCardNumber,
      aadharCardNumber: formData.aadharCardNumber,
      coaCardNumber: formData.coaCardNumber,
      qualifications,
      experiences,
      documents
    };

    return apiData;
  },

  /**
   * Generate PDF for application
   */
  generateApplicationPdf: async (applicationId: string): Promise<{ success: boolean; message?: string; pdfUrl?: string }> => {
    try {
      const response = await api.post('/Pdf/generate', {
        applicationId: applicationId
      });

      return {
        success: true,
        message: 'PDF generated successfully',
        pdfUrl: response.data.pdfUrl || response.data.url
      };
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      
      let message = 'Failed to generate PDF. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  },

  /**
   * Submit application to the API
   */
  submitApplication: async (formData: ApplicationFormInput): Promise<{ success: boolean; message?: string; applicationId?: string }> => {
    try {
      // Transform and upload data
      const apiData = await applicationService.transformAndUploadData(formData);

      // Submit to API
      const response = await api.post('/Application/create', apiData);

      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: response.data.id || response.data.applicationId
      };
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      let message = 'Failed to submit application. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  },

  /**
   * Save application draft to localStorage
   */
  saveDraft: (formData: ApplicationFormInput): void => {
    try {
      // Create a serializable version (without File objects)
      const draftData = {
        ...formData,
        panCardFile: formData.panCardFile ? { name: formData.panCardFile.name } : null,
        aadharCardFile: formData.aadharCardFile ? { name: formData.aadharCardFile.name } : null,
        coaCertificateFile: formData.coaCertificateFile ? { name: formData.coaCertificateFile.name } : null,
        profilePictureFile: formData.profilePictureFile ? { name: formData.profilePictureFile.name } : null,
        electricityBillFile: formData.electricityBillFile ? { name: formData.electricityBillFile.name } : null,
        qualifications: formData.qualifications.map(q => ({
          ...q,
          certificateFile: q.certificateFile ? { name: q.certificateFile.name } : null,
          marksheetFile: q.marksheetFile ? { name: q.marksheetFile.name } : null,
        })),
        experiences: formData.experiences.map(e => ({
          ...e,
          certificateFile: e.certificateFile ? { name: e.certificateFile.name } : null,
        })),
        additionalDocuments: formData.additionalDocuments.map(d => ({
          ...d,
          file: d.file ? { name: d.file.name } : null,
        }))
      };

      localStorage.setItem('pmc_application_draft', JSON.stringify(draftData));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  },

  /**
   * Load application draft from localStorage
   */
  loadDraft: (): Partial<ApplicationFormInput> | null => {
    try {
      const draftData = localStorage.getItem('pmc_application_draft');
      if (draftData) {
        return JSON.parse(draftData);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
    return null;
  },

  /**
   * Clear application draft from localStorage
   */
  clearDraft: (): void => {
    localStorage.removeItem('pmc_application_draft');
  },

  /**
   * Fetch user's applications list
   */
  fetchApplications: async (status?: number, pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const requestData: any = {
        pageNumber,
        pageSize
      };
      
      if (status !== undefined) {
        requestData.status = status;
      }

      const response = await api.post('/Application/list', requestData);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  /**
   * Fetch applications for officers (all applications visible to officers)
   */
  fetchOfficerApplications: async (status?: number, pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const requestData: any = {
        pageNumber,
        pageSize
      };
      
      if (status !== undefined) {
        requestData.status = status;
      }

      const response = await api.post('/Application/list', requestData);
      return response.data;
    } catch (error) {
      console.error('Error fetching officer applications:', error);
      throw error;
    }
  },

  /**
   * Get application details by ID
   */
  getApplicationById: async (applicationId: string) => {
    try {
      const response = await api.get(`/Application/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error;
    }
  },

  /**
   * Update application status (officer action)
   */
  updateApplicationStatus: async (applicationId: string, status: number, comments?: string) => {
    try {
      const response = await api.post('/Application/update-status', {
        applicationId,
        status,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  /**
   * Approve application (officer action)
   */
  approveApplication: async (applicationId: string, comments?: string) => {
    try {
      const response = await api.post('/Application/approve', {
        applicationId,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  },

  /**
   * Reject application (officer action)
   */
  rejectApplication: async (applicationId: string, rejectionReasons?: string, comments?: string) => {
    try {
      const response = await api.post('/Application/reject', {
        applicationId,
        rejectionReasons,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  },

  /**
   * Forward application to next stage/officer
   */
  forwardApplication: async (applicationId: string, targetRole: string, comments?: string) => {
    try {
      const response = await api.post('/Application/forward', {
        applicationId,
        targetRole,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error forwarding application:', error);
      throw error;
    }
  },

  /**
   * Schedule appointment for document verification
   */
  scheduleAppointment: async (applicationId: string, appointmentDate: string, appointmentTime: string, location?: string) => {
    try {
      const response = await api.post('/Application/schedule-appointment', {
        applicationId,
        appointmentDate,
        appointmentTime,
        location
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  },

  /**
   * Sign document with digital signature
   */
  signDocument: async (applicationId: string, documentType: string, stage: number) => {
    try {
      const response = await api.post('/Application/sign-document', {
        applicationId,
        documentType,
        stage
      });
      return response.data;
    } catch (error) {
      console.error('Error signing document:', error);
      throw error;
    }
  },

  /**
   * Generate OTP for officer actions (approve/reject)
   */
  generateOTP: async (applicationId: string, officerId: string) => {
    try {
      const response = await api.post('/Application/generate-otp', {
        applicationId,
        officerId
      });
      return response.data;
    } catch (error) {
      console.error('Error generating OTP:', error);
      throw error;
    }
  },

  /**
   * Apply digital signature using OTP
   */
  applyDigitalSignature: async (applicationId: string, otp: string, officerId?: string) => {
    try {
      const response = await api.post('/Application/apply-digital-signature', {
        applicationId,
        otp,
        officerId
      });
      return response.data;
    } catch (error) {
      console.error('Error applying digital signature:', error);
      throw error;
    }
  },

  /**
   * Approve application by Junior Engineer with OTP
   */
  approveByJuniorEngineer: async (applicationId: string, otp: string, officerId: string, comments?: string) => {
    try {
      const response = await api.post('/Application/approve-junior-engineer', {
        applicationId,
        otp,
        officerId,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving by Junior Engineer:', error);
      throw error;
    }
  },

  /**
   * Approve application by Assistant Engineer with OTP
   */
  approveByAssistantEngineer: async (applicationId: string, otp: string, officerId: string, comments?: string) => {
    try {
      const response = await api.post('/Application/approve-assistant-engineer', {
        applicationId,
        otp,
        officerId,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving by Assistant Engineer:', error);
      throw error;
    }
  },

  /**
   * Reject application by officer with officer ID
   */
  rejectApplicationByOfficer: async (applicationId: string, officerId: string, reason: string) => {
    try {
      const response = await api.post('/Application/reject-by-officer', {
        applicationId,
        officerId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting application by officer:', error);
      throw error;
    }
  },

  /**
   * Verify OTP for officer authentication
   */
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await api.post('/Auth/verify-otp', {
        email,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Process payment completion (update application status after payment)
   */
  processPaymentCompletion: async (applicationId: string, paymentId: string) => {
    try {
      const response = await api.post('/Application/payment-completed', {
        applicationId,
        paymentId,
        completedDate: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment completion:', error);
      throw error;
    }
  },

  /**
   * Update application to forwarded to clerk after payment
   */
  forwardToClerk: async (applicationId: string) => {
    try {
      const response = await api.post('/Application/forward-to-clerk', {
        applicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error forwarding to clerk:', error);
      throw error;
    }
  },

  /**
   * TEMPORARY TESTING FUNCTION - Update application stage directly (bypasses OTP)
   * TODO: Remove this function after testing is complete
   */
  updateStageForTesting: async (applicationId: string, newStage: number, comments: string = 'Testing bypass', isApproved: boolean = true, officerId: string) => {
    try {
      const response = await api.post('/Application/update-stage', {
        applicationId,
        newStage,
        comments,
        isApproved,
        officerId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating stage for testing:', error);
      throw error;
    }
  }
};