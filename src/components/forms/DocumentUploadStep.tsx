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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Document Information</h3>
        <p className="text-slate-600 text-sm mt-1">Upload clear copies of your documents. Ensure all numbers match your official documents.</p>
      </div>

      {/* Compact Guidelines */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-100">
        <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> All documents must be clear and readable. Ensure document numbers match uploaded files. Accepted formats: PDF, JPG, PNG.
        </p>
      </div>

      {/* Documents Grid */}
      <div className="space-y-6">
        {/* PAN Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
          <div className="space-y-2">
            <Label htmlFor="panCardNumber" className="text-slate-900 font-medium text-sm">
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
                    'uppercase h-10',
                    getFieldError('panCardNumber') 
                      ? 'border-red-300 focus:border-red-500' 
                      : ''
                  )}
                />
              )}
            </Field>
            {getFieldError('panCardNumber') && (
              <p className="text-red-500 text-xs">{getFieldError('panCardNumber')}</p>
            )}
            <p className="text-xs text-slate-500">Format: ABCDE1234F</p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-900 font-medium text-sm">
              Upload PAN Card <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Choose File"
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
            <p className="text-xs text-slate-500">PDF, JPG, PNG • Max 5MB</p>
          </div>
        </div>

        {/* Aadhar Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
          <div className="space-y-2">
            <Label htmlFor="aadharCardNumber" className="text-slate-900 font-medium text-sm">
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
                    'h-10',
                    getFieldError('aadharCardNumber') 
                      ? 'border-red-300 focus:border-red-500' 
                      : ''
                  )}
                />
              )}
            </Field>
            {getFieldError('aadharCardNumber') && (
              <p className="text-red-500 text-xs">{getFieldError('aadharCardNumber')}</p>
            )}
            <p className="text-xs text-slate-500">12-digit number</p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-900 font-medium text-sm">
              Upload Aadhar Card <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Choose File"
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
            <p className="text-xs text-slate-500">PDF, JPG, PNG • Max 5MB</p>
          </div>
        </div>

        {/* COA Certificate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
          <div className="space-y-2">
            <Label htmlFor="coaCardNumber" className="text-slate-900 font-medium text-sm">
              COA Certificate Number <span className="text-red-500">*</span>
            </Label>
            <Field name="coaCardNumber">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="coaCardNumber"
                  type="text"
                  placeholder="Certificate Number"
                  className={cn(
                    'h-10',
                    getFieldError('coaCardNumber') 
                      ? 'border-red-300 focus:border-red-500' 
                      : ''
                  )}
                />
              )}
            </Field>
            {getFieldError('coaCardNumber') && (
              <p className="text-red-500 text-xs">{getFieldError('coaCardNumber')}</p>
            )}
            <p className="text-xs text-slate-500">Council of Architecture</p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-900 font-medium text-sm">
              Upload COA Certificate <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Choose File"
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
            <p className="text-xs text-slate-500">PDF, JPG, PNG • Max 5MB</p>
          </div>
        </div>

        {/* Profile Picture & Electricity Bill - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Picture */}
          <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
            <Label className="text-slate-900 font-medium text-sm mb-2 block">
              Profile Picture <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Choose File"
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
            <p className="text-xs text-slate-500 mt-2">Passport size • JPG, PNG • Max 2MB</p>
          </div>

          {/* Electricity Bill */}
          <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
            <Label className="text-slate-900 font-medium text-sm mb-2 block">
              Electricity Bill <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              label="Choose File"
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
            <p className="text-xs text-slate-500 mt-2">Address proof • PDF, JPG, PNG • Max 5MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};