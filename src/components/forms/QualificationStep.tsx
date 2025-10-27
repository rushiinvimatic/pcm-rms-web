import { Field, FieldArray } from 'formik';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FileUpload } from './FileUpload';
import { cn } from '../../utils/cn';
import { 
  SPECIALIZATION_LABELS, 
  MONTHS,
  type ApplicationFormInput, 
  type QualificationInput 
} from '../../types/application';

interface QualificationStepProps {
  values: ApplicationFormInput;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

export const QualificationStep = ({ values, errors, touched, setFieldValue }: QualificationStepProps) => {
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

  const addQualification = (arrayHelpers: any) => {
    const newQualification: QualificationInput = {
      id: Date.now().toString(),
      instituteName: '',
      universityName: '',
      specialization: '',
      degreeName: '',
      passingMonth: '',
      yearOfPassing: '',
      certificateFile: null,
      marksheetFile: null,
    };
    arrayHelpers.push(newQualification);
  };

  const removeQualification = (arrayHelpers: any, index: number) => {
    arrayHelpers.remove(index);
  };

  // Generate years from 1970 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Educational Qualification</h3>
        <p className="text-gray-600 mt-1">Please provide your educational background details.</p>
      </div>

      <FieldArray name="qualifications">
        {({ push, remove }) => (
          <div className="space-y-6">
            {values.qualifications.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No qualifications added yet</p>
                <Button
                  type="button"
                  onClick={() => addQualification({ push })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add First Qualification
                </Button>
              </div>
            )}

            {values.qualifications.map((qualification, index) => (
              <div key={qualification.id} className="border rounded-lg p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-800">
                    Qualification {index + 1}
                  </h4>
                  {values.qualifications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQualification({ remove }, index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Institute Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`qualifications.${index}.instituteName`} className="text-gray-700 font-medium">
                      Institute Name <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`qualifications.${index}.instituteName`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`qualifications.${index}.instituteName`}
                          type="text"
                          placeholder="Enter institute name"
                          className={cn(
                            getFieldError(`qualifications.${index}.instituteName`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                        />
                      )}
                    </Field>
                    {getFieldError(`qualifications.${index}.instituteName`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`qualifications.${index}.instituteName`)}</p>
                    )}
                  </div>

                  {/* University Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`qualifications.${index}.universityName`} className="text-gray-700 font-medium">
                      University Name <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`qualifications.${index}.universityName`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`qualifications.${index}.universityName`}
                          type="text"
                          placeholder="Enter university name"
                          className={cn(
                            getFieldError(`qualifications.${index}.universityName`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                        />
                      )}
                    </Field>
                    {getFieldError(`qualifications.${index}.universityName`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`qualifications.${index}.universityName`)}</p>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <Label htmlFor={`qualifications.${index}.specialization`} className="text-gray-700 font-medium">
                      Specialization <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`qualifications.${index}.specialization`}>
                      {({ field }: any) => (
                        <select
                          {...field}
                          id={`qualifications.${index}.specialization`}
                          className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            getFieldError(`qualifications.${index}.specialization`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          <option value="">Select Specialization</option>
                          {Object.entries(SPECIALIZATION_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    {getFieldError(`qualifications.${index}.specialization`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`qualifications.${index}.specialization`)}</p>
                    )}
                  </div>

                  {/* Degree Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`qualifications.${index}.degreeName`} className="text-gray-700 font-medium">
                      Degree Name <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`qualifications.${index}.degreeName`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`qualifications.${index}.degreeName`}
                          type="text"
                          placeholder="e.g., B.Arch, M.Arch, B.E."
                          className={cn(
                            getFieldError(`qualifications.${index}.degreeName`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                        />
                      )}
                    </Field>
                    {getFieldError(`qualifications.${index}.degreeName`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`qualifications.${index}.degreeName`)}</p>
                    )}
                  </div>

                  {/* Passing Month */}
                  <div className="space-y-2">
                    <Label htmlFor={`qualifications.${index}.passingMonth`} className="text-gray-700 font-medium">
                      Passing Month <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`qualifications.${index}.passingMonth`}>
                      {({ field }: any) => (
                        <select
                          {...field}
                          id={`qualifications.${index}.passingMonth`}
                          className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            getFieldError(`qualifications.${index}.passingMonth`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          <option value="">Select Month</option>
                          {MONTHS.map((month, monthIndex) => (
                            <option key={monthIndex} value={monthIndex + 1}>
                              {month}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    {getFieldError(`qualifications.${index}.passingMonth`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`qualifications.${index}.passingMonth`)}</p>
                    )}
                  </div>

                  {/* Year of Passing */}
                  <div className="space-y-2">
                    <Label htmlFor={`qualifications.${index}.yearOfPassing`} className="text-gray-700 font-medium">
                      Year of Passing <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`qualifications.${index}.yearOfPassing`}>
                      {({ field }: any) => (
                        <select
                          {...field}
                          id={`qualifications.${index}.yearOfPassing`}
                          className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            getFieldError(`qualifications.${index}.yearOfPassing`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          <option value="">Select Year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    {getFieldError(`qualifications.${index}.yearOfPassing`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`qualifications.${index}.yearOfPassing`)}</p>
                    )}
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Certificate Upload */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Degree Certificate <span className="text-red-500">*</span>
                    </Label>
                    <FileUpload
                      label="Upload Certificate"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5}
                      required={true}
                      currentFile={qualification.certificateFile}
                      uploadedFileId={qualification.certificateFileId}
                      uploadedFileName={qualification.certificateFileName}
                      error={getFieldError(`qualifications.${index}.certificateFile`)}
                      onFileSelect={(file) => setFieldValue(`qualifications.${index}.certificateFile`, file)}
                      onFileUpload={(fileId, fileName) => {
                        setFieldValue(`qualifications.${index}.certificateFileId`, fileId);
                        setFieldValue(`qualifications.${index}.certificateFileName`, fileName);
                      }}
                      onFileDelete={() => {
                        setFieldValue(`qualifications.${index}.certificateFile`, null);
                        setFieldValue(`qualifications.${index}.certificateFileId`, '');
                        setFieldValue(`qualifications.${index}.certificateFileName`, '');
                      }}
                    />
                  </div>

                  {/* Marksheet Upload */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Final Year Marksheet <span className="text-red-500">*</span>
                    </Label>
                    <FileUpload
                      label="Upload Marksheet"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5}
                      required={true}
                      currentFile={qualification.marksheetFile}
                      uploadedFileId={qualification.marksheetFileId}
                      uploadedFileName={qualification.marksheetFileName}
                      error={getFieldError(`qualifications.${index}.marksheetFile`)}
                      onFileSelect={(file) => setFieldValue(`qualifications.${index}.marksheetFile`, file)}
                      onFileUpload={(fileId, fileName) => {
                        setFieldValue(`qualifications.${index}.marksheetFileId`, fileId);
                        setFieldValue(`qualifications.${index}.marksheetFileName`, fileName);
                      }}
                      onFileDelete={() => {
                        setFieldValue(`qualifications.${index}.marksheetFile`, null);
                        setFieldValue(`qualifications.${index}.marksheetFileId`, '');
                        setFieldValue(`qualifications.${index}.marksheetFileName`, '');
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {values.qualifications.length > 0 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addQualification({ push })}
                  className="border-dashed border-2 border-gray-300 hover:border-gray-400"
                >
                  + Add Another Qualification
                </Button>
              </div>
            )}
          </div>
        )}
      </FieldArray>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Educational Guidelines:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Add all your relevant educational qualifications</li>
          <li>• Start with your highest qualification first</li>
          <li>• Upload clear copies of certificates and marksheets</li>
          <li>• Supported formats: PDF, JPG, JPEG, PNG (Max 5MB each)</li>
          <li>• Ensure all information matches your certificates</li>
        </ul>
      </div>
    </div>
  );
};