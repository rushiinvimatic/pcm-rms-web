import React, { useState, useEffect } from 'react';
import { Formik, Form, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../../utils/cn';
import type { ApplicationFormInput } from '../../types/application';
import { useToast } from '../../hooks/use-toast';
import { StepIndicator } from './StepIndicator';
import { applicationService } from '../../services/application.service';
import { PersonalInfoStep } from './PersonalInfoStep';
import { AddressStep } from './AddressStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { QualificationStep } from './QualificationStep';
import { ExperienceStep } from './ExperienceStep';
import { ReviewStep } from './ReviewStep';
import { useLoading } from '../../hooks/useLoading';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 6;

const steps = [
  { id: 1, title: 'Personal Information', description: 'Basic details and position' },
  { id: 2, title: 'Address Information', description: 'Current and permanent address' },
  { id: 3, title: 'Documents', description: 'Identity documents and certificates' },
  { id: 4, title: 'Qualifications', description: 'Educational background' },
  { id: 5, title: 'Experience', description: 'Work experience details' },
  { id: 6, title: 'Review & Submit', description: 'Final review and submission' },
];

const initialValues: ApplicationFormInput = {
  // Personal Information
  firstName: '',
  middleName: '',
  lastName: '',
  motherName: '',
  mobileNumber: '',
  emailAddress: '',
  positionType: '',
  bloodGroup: '',
  height: '',
  gender: '',
  dateOfBirth: '',

  // Address Information
  permanentAddress: {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '',
  },
  currentAddress: {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '',
  },
  sameAsPermanent: false,

  // Document Information
  panCardNumber: '',
  panCardFile: null,
  panCardFileId: '',
  panCardFileName: '',
  aadharCardNumber: '',
  aadharCardFile: null,
  aadharCardFileId: '',
  aadharCardFileName: '',
  coaCardNumber: '',
  coaCertificateFile: null,
  coaCertificateFileId: '',
  coaCertificateFileName: '',
  profilePictureFile: null,
  profilePictureFileId: '',
  profilePictureFileName: '',
  electricityBillFile: null,
  electricityBillFileId: '',
  electricityBillFileName: '',

  // Educational Qualifications
  qualifications: [],

  // Work Experience
  experiences: [],

  // Additional Documents
  additionalDocuments: [],
};

// Validation schemas for each step
const validationSchemas = [
  // Step 1: Personal Information
  Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    motherName: Yup.string().required('Mother name is required'),
    mobileNumber: Yup.string()
      .matches(/^[6-9]\d{9}$/, 'Invalid mobile number')
      .required('Mobile number is required'),
    emailAddress: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    positionType: Yup.string().required('Position is required'),
    height: Yup.string().required('Height is required'),
    bloodGroup: Yup.string().required('Blood group is required'),
    dateOfBirth: Yup.string().required('Date of birth is required'),
    gender: Yup.string().required('Gender is required'),
  }),
  
  // Step 2: Address Information
  Yup.object({
    permanentAddress: Yup.object({
      addressLine1: Yup.string().required('Address line 1 is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      country: Yup.string().required('Country is required'),
      pinCode: Yup.string()
        .matches(/^\d{6}$/, 'Invalid PIN code')
        .required('PIN code is required'),
    }),
    currentAddress: Yup.object().when('sameAsPermanent', {
      is: false,
      then: (schema) => schema.shape({
        addressLine1: Yup.string().required('Address line 1 is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        country: Yup.string().required('Country is required'),
        pinCode: Yup.string()
          .matches(/^\d{6}$/, 'Invalid PIN code')
          .required('PIN code is required'),
      }),
    }),
  }),
  
  // Step 3: Documents
  Yup.object({
    panCardNumber: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
      .required('PAN number is required'),
    aadharCardNumber: Yup.string()
      .matches(/^\d{12}$/, 'Aadhar number must be 12 digits')
      .required('Aadhar number is required'),
    coaCardNumber: Yup.string().required('COA certificate number is required'),
    panCardFileId: Yup.string().required('PAN card file is required'),
    aadharCardFileId: Yup.string().required('Aadhar card file is required'),
    coaCertificateFileId: Yup.string().required('COA certificate file is required'),
  }),
  
  // Step 4: Qualifications
  Yup.object({
    qualifications: Yup.array()
      .of(
        Yup.object({
          instituteName: Yup.string().required('Institute name is required'),
          universityName: Yup.string().required('University name is required'),
          specialization: Yup.string().required('Specialization is required'),
          degreeName: Yup.string().required('Degree name is required'),
          passingMonth: Yup.string().required('Passing month is required'),
          yearOfPassing: Yup.string().required('Year of passing is required'),
          certificateFileId: Yup.string().required('Certificate file is required'),
          marksheetFileId: Yup.string().required('Marksheet file is required'),
        })
      )
      .min(1, 'At least one qualification is required'),
  }),
  
  // Step 5: Experience
  Yup.object({
    experiences: Yup.array()
      .of(
        Yup.object({
          companyName: Yup.string().required('Company name is required'),
          position: Yup.string().required('Position is required'),
          yearsOfExperience: Yup.string().required('Years of experience is required'),
          fromDate: Yup.string().required('From date is required'),
          toDate: Yup.string().required('To date is required'),
          certificateFileId: Yup.string().required('Experience certificate is required'),
        })
      )
      .min(1, 'At least one work experience is required'),
  }),
  
  // Step 6: Review & Submit
  Yup.object(),
];

export const MultiStepApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { isLoading, showLoader, hideLoader } = useLoading();
  const navigate = useNavigate();

  // Load saved draft on component mount
  useEffect(() => {
    const draft = applicationService.loadDraft();
    if (draft && Object.keys(draft).length > 0) {
      toast({
        title: 'Draft Found',
        description: 'Your previous application draft has been loaded.',
      });
    }
  }, [toast]);

  const handleNext = async (formik: FormikProps<ApplicationFormInput>) => {
    const isValid = await formik.validateForm();
    if (Object.keys(isValid).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      // Save draft after each step
      applicationService.saveDraft(formik.values);
    } else {
      formik.setTouched(
        Object.keys(isValid).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (values: ApplicationFormInput) => {
    if (currentStep < TOTAL_STEPS) {
      return;
    }

    showLoader('Submitting your application...');
    try {
      const result: any = await applicationService.submitApplication(values);
      
      if (result.success) {
        // Clear draft on successful submission
        applicationService.clearDraft();
        
        // Show initial success message
        toast({
          title: 'Application Submitted Successfully',
          description: `Your application has been submitted with ID: ${result.applicationId}`,
        });
        
        // Generate PDF after successful submission
        showLoader('Generating application PDF...');
        try {
          await applicationService.generateApplicationPdf(result.applicationId);          
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
        }
        
        // Navigate to applications page or dashboard
        navigate('/user/applications');
      } else {
        toast({
          title: 'Submission Failed',
          description: result.message || 'Failed to submit application. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      hideLoader();
    }
  };

  const getCurrentStepSchema = () => {
    return validationSchemas[currentStep - 1];
  };

  const renderStepContent = (formik: FormikProps<ApplicationFormInput>) => {
    const stepProps = {
      values: formik.values,
      errors: formik.errors,
      touched: formik.touched,
      setFieldValue: formik.setFieldValue,
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <AddressStep {...stepProps} />;
      case 3:
        return <DocumentUploadStep {...stepProps} />;
      case 4:
        return <QualificationStep {...stepProps} />;
      case 5:
        return <ExperienceStep {...stepProps} />;
      case 6:
        return <ReviewStep values={formik.values} />;
      default:
        return null;
    }
  };

  const getInitialValues = (): ApplicationFormInput => {
    const draft = applicationService.loadDraft();
    return draft ? { ...initialValues, ...draft } : initialValues;
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Form
          </h2>
          <p className="text-gray-600">
            Complete all steps to submit your application
          </p>
        </div>

          {/* Step Indicator */}
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            className="mb-8"
          />

          <Formik
            initialValues={getInitialValues()}
            validationSchema={getCurrentStepSchema()}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <Form className="space-y-6">
                {/* Step Content */}
                <div className="min-h-[400px]">
                  {renderStepContent(formik)}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => applicationService.saveDraft(formik.values)}
                    >
                      Save Draft
                    </Button>

                    {currentStep < TOTAL_STEPS ? (
                      <Button
                        type="button"
                        onClick={() => handleNext(formik)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          'min-w-[120px]',
                          isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {isLoading ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
    </div>
  );
};