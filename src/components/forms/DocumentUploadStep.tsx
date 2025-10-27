import { Field } from 'formik';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FileUpload } from './FileUpload';
import { cn } from '../../utils/cn';
import type { ApplicationFormInput } from '../../types/application';

interface DocumentUploadStepProps {
  values: ApplicationFormInput;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

export const DocumentUploadStep = ({ values, errors, touched, setFieldValue }: DocumentUploadStepProps) => {
  const getFieldError = (fieldName: string) => {
    const fieldPath = fieldName.split('.');
    let error = errors;
    let touch = touched;
    
    for (const path of fieldPath) {
      error = error?.[path];
      touch = touch?.[path];
    }
    
    return touch && error ? error : null;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Document Information</h3>
        <p className="text-gray-600 mt-1">Please provide your document details and upload required documents.</p>
      </div>

      {/* Document Numbers Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2">Document Numbers</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PAN Card Number */}
          <div className="space-y-2">
            <Label htmlFor="panCardNumber" className="text-gray-700 font-medium">
              PAN Card Number <span className="text-red-500">*</span>
            </Label>
            <Field name="panCardNumber">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="panCardNumber"
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={cn(
                    getFieldError('panCardNumber') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300'
                  )}
                />
              )}
            </Field>
            {getFieldError('panCardNumber') && (
              <p className="text-red-500 text-sm">{getFieldError('panCardNumber')}</p>
            )}
          </div>

          {/* Aadhar Card Number */}
          <div className="space-y-2">
            <Label htmlFor="aadharCardNumber" className="text-gray-700 font-medium">
              Aadhar Card Number <span className="text-red-500">*</span>
            </Label>
            <Field name="aadharCardNumber">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="aadharCardNumber"
                  type="text"
                  placeholder="123456789012"
                  maxLength={12}
                  className={cn(
                    getFieldError('aadharCardNumber') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300'
                  )}
                />
              )}
            </Field>
            {getFieldError('aadharCardNumber') && (
              <p className="text-red-500 text-sm">{getFieldError('aadharCardNumber')}</p>
            )}
          </div>

          {/* COA Certificate Number */}
          <div className="space-y-2">
            <Label htmlFor="coaCardNumber" className="text-gray-700 font-medium">
              COA Certificate Number <span className="text-red-500">*</span>
            </Label>
            <Field name="coaCardNumber">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="coaCardNumber"
                  type="text"
                  placeholder="COA Certificate Number"
                  className={cn(
                    getFieldError('coaCardNumber') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300'
                  )}
                />
              )}
            </Field>
            {getFieldError('coaCardNumber') && (
              <p className="text-red-500 text-sm">{getFieldError('coaCardNumber')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Uploads Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2">Document Uploads</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PAN Card Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              PAN Card Document <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Upload PAN Card"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              required={true}
              currentFile={values.panCardFile}
              uploadedFileId={values.panCardFileId}
              uploadedFileName={values.panCardFileName}
              error={getFieldError('panCardFile')}
              onFileSelect={(file) => setFieldValue('panCardFile', file)}
              onFileUpload={(fileId, fileName) => {
                setFieldValue('panCardFileId', fileId);
                setFieldValue('panCardFileName', fileName);
              }}
              onFileDelete={() => {
                setFieldValue('panCardFile', null);
                setFieldValue('panCardFileId', '');
                setFieldValue('panCardFileName', '');
              }}
            />
          </div>

          {/* Aadhar Card Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Aadhar Card Document <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Upload Aadhar Card"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              required={true}
              currentFile={values.aadharCardFile}
              uploadedFileId={values.aadharCardFileId}
              uploadedFileName={values.aadharCardFileName}
              error={getFieldError('aadharCardFile')}
              onFileSelect={(file) => setFieldValue('aadharCardFile', file)}
              onFileUpload={(fileId, fileName) => {
                setFieldValue('aadharCardFileId', fileId);
                setFieldValue('aadharCardFileName', fileName);
              }}
              onFileDelete={() => {
                setFieldValue('aadharCardFile', null);
                setFieldValue('aadharCardFileId', '');
                setFieldValue('aadharCardFileName', '');
              }}
            />
          </div>

          {/* COA Certificate Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              COA Certificate <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Upload COA Certificate"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              required={true}
              currentFile={values.coaCertificateFile}
              uploadedFileId={values.coaCertificateFileId}
              uploadedFileName={values.coaCertificateFileName}
              error={getFieldError('coaCertificateFile')}
              onFileSelect={(file) => setFieldValue('coaCertificateFile', file)}
              onFileUpload={(fileId, fileName) => {
                setFieldValue('coaCertificateFileId', fileId);
                setFieldValue('coaCertificateFileName', fileName);
              }}
              onFileDelete={() => {
                setFieldValue('coaCertificateFile', null);
                setFieldValue('coaCertificateFileId', '');
                setFieldValue('coaCertificateFileName', '');
              }}
            />
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Profile Picture <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Upload Profile Picture"
              accept=".jpg,.jpeg,.png"
              maxSize={2}
              required={true}
              currentFile={values.profilePictureFile}
              uploadedFileId={values.profilePictureFileId}
              uploadedFileName={values.profilePictureFileName}
              error={getFieldError('profilePictureFile')}
              onFileSelect={(file) => setFieldValue('profilePictureFile', file)}
              onFileUpload={(fileId, fileName) => {
                setFieldValue('profilePictureFileId', fileId);
                setFieldValue('profilePictureFileName', fileName);
              }}
              onFileDelete={() => {
                setFieldValue('profilePictureFile', null);
                setFieldValue('profilePictureFileId', '');
                setFieldValue('profilePictureFileName', '');
              }}
            />
          </div>

          {/* Electricity Bill Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Electricity Bill <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Upload Electricity Bill"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              required={true}
              currentFile={values.electricityBillFile}
              uploadedFileId={values.electricityBillFileId}
              uploadedFileName={values.electricityBillFileName}
              error={getFieldError('electricityBillFile')}
              onFileSelect={(file) => setFieldValue('electricityBillFile', file)}
              onFileUpload={(fileId, fileName) => {
                setFieldValue('electricityBillFileId', fileId);
                setFieldValue('electricityBillFileName', fileName);
              }}
              onFileDelete={() => {
                setFieldValue('electricityBillFile', null);
                setFieldValue('electricityBillFileId', '');
                setFieldValue('electricityBillFileName', '');
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Document Guidelines:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• All documents should be clear and readable</li>
          <li>• Supported formats: PDF, JPG, JPEG, PNG</li>
          <li>• Maximum file size: 5MB (Profile picture: 2MB)</li>
          <li>• PAN Card format: ABCDE1234F</li>
          <li>• Aadhar Card: 12-digit number</li>
          <li>• Ensure all document numbers match the uploaded documents</li>
        </ul>
      </div>
    </div>
  );
};