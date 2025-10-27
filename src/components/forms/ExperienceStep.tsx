import { Field, FieldArray } from 'formik';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FileUpload } from './FileUpload';
import { cn } from '../../utils/cn';
import type { ApplicationFormInput, ExperienceInput } from '../../types/application';

interface ExperienceStepProps {
  values: ApplicationFormInput;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

export const ExperienceStep = ({ values, errors, touched, setFieldValue }: ExperienceStepProps) => {
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

  const addExperience = (arrayHelpers: any) => {
    const newExperience: ExperienceInput = {
      id: Date.now().toString(),
      companyName: '',
      position: '',
      yearsOfExperience: '',
      fromDate: '',
      toDate: '',
      certificateFile: null,
    };
    arrayHelpers.push(newExperience);
  };

  const removeExperience = (arrayHelpers: any, index: number) => {
    arrayHelpers.remove(index);
  };

  const calculateExperience = (fromDate: string, toDate: string): string => {
    if (!fromDate || !toDate) return '';
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (to <= from) return '';
    
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.round(diffYears * 10) / 10 + ' years';
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
        <p className="text-gray-600 mt-1">Please provide your professional work experience details.</p>
      </div>

      <FieldArray name="experiences">
        {({ push, remove }) => (
          <div className="space-y-6">
            {values.experiences.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No work experience added yet</p>
                <Button
                  type="button"
                  onClick={() => addExperience({ push })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add First Experience
                </Button>
              </div>
            )}

            {values.experiences.map((experience, index) => (
              <div key={experience.id} className="border rounded-lg p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-800">
                    Experience {index + 1}
                  </h4>
                  {values.experiences.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExperience({ remove }, index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`experiences.${index}.companyName`} className="text-gray-700 font-medium">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`experiences.${index}.companyName`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`experiences.${index}.companyName`}
                          type="text"
                          placeholder="Enter company name"
                          className={cn(
                            getFieldError(`experiences.${index}.companyName`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                        />
                      )}
                    </Field>
                    {getFieldError(`experiences.${index}.companyName`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`experiences.${index}.companyName`)}</p>
                    )}
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <Label htmlFor={`experiences.${index}.position`} className="text-gray-700 font-medium">
                      Position/Designation <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`experiences.${index}.position`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`experiences.${index}.position`}
                          type="text"
                          placeholder="Enter position/designation"
                          className={cn(
                            getFieldError(`experiences.${index}.position`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                        />
                      )}
                    </Field>
                    {getFieldError(`experiences.${index}.position`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`experiences.${index}.position`)}</p>
                    )}
                  </div>

                  {/* From Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`experiences.${index}.fromDate`} className="text-gray-700 font-medium">
                      From Date <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`experiences.${index}.fromDate`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`experiences.${index}.fromDate`}
                          type="date"
                          className={cn(
                            getFieldError(`experiences.${index}.fromDate`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                          onChange={(e) => {
                            setFieldValue(`experiences.${index}.fromDate`, e.target.value);
                            // Auto-calculate years of experience if both dates are set
                            if (experience.toDate) {
                              const years = calculateExperience(e.target.value, experience.toDate);
                              if (years) {
                                setFieldValue(`experiences.${index}.yearsOfExperience`, years.split(' ')[0]);
                              }
                            }
                          }}
                        />
                      )}
                    </Field>
                    {getFieldError(`experiences.${index}.fromDate`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`experiences.${index}.fromDate`)}</p>
                    )}
                  </div>

                  {/* To Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`experiences.${index}.toDate`} className="text-gray-700 font-medium">
                      To Date <span className="text-red-500">*</span>
                    </Label>
                    <Field name={`experiences.${index}.toDate`}>
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id={`experiences.${index}.toDate`}
                          type="date"
                          className={cn(
                            getFieldError(`experiences.${index}.toDate`) 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-300'
                          )}
                          onChange={(e) => {
                            setFieldValue(`experiences.${index}.toDate`, e.target.value);
                            // Auto-calculate years of experience if both dates are set
                            if (experience.fromDate) {
                              const years = calculateExperience(experience.fromDate, e.target.value);
                              if (years) {
                                setFieldValue(`experiences.${index}.yearsOfExperience`, years.split(' ')[0]);
                              }
                            }
                          }}
                        />
                      )}
                    </Field>
                    {getFieldError(`experiences.${index}.toDate`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`experiences.${index}.toDate`)}</p>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`experiences.${index}.yearsOfExperience`} className="text-gray-700 font-medium">
                      Years of Experience <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Field name={`experiences.${index}.yearsOfExperience`}>
                        {({ field }: any) => (
                          <Input
                            {...field}
                            id={`experiences.${index}.yearsOfExperience`}
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            placeholder="Enter years of experience"
                            className={cn(
                              "flex-1",
                              getFieldError(`experiences.${index}.yearsOfExperience`) 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300'
                            )}
                          />
                        )}
                      </Field>
                      {experience.fromDate && experience.toDate && (
                        <span className="text-sm text-gray-500">
                          (Calculated: {calculateExperience(experience.fromDate, experience.toDate)})
                        </span>
                      )}
                    </div>
                    {getFieldError(`experiences.${index}.yearsOfExperience`) && (
                      <p className="text-red-500 text-sm">{getFieldError(`experiences.${index}.yearsOfExperience`)}</p>
                    )}
                  </div>
                </div>

                {/* Experience Certificate Upload */}
                <div className="mt-6">
                  <Label className="text-gray-700 font-medium">
                    Experience Certificate <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <FileUpload
                      label="Upload Experience Certificate"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5}
                      required={true}
                      currentFile={experience.certificateFile}
                      uploadedFileId={experience.certificateFileId}
                      uploadedFileName={experience.certificateFileName}
                      error={getFieldError(`experiences.${index}.certificateFile`)}
                      onFileSelect={(file) => setFieldValue(`experiences.${index}.certificateFile`, file)}
                      onFileUpload={(fileId, fileName) => {
                        setFieldValue(`experiences.${index}.certificateFileId`, fileId);
                        setFieldValue(`experiences.${index}.certificateFileName`, fileName);
                      }}
                      onFileDelete={() => {
                        setFieldValue(`experiences.${index}.certificateFile`, null);
                        setFieldValue(`experiences.${index}.certificateFileId`, '');
                        setFieldValue(`experiences.${index}.certificateFileName`, '');
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {values.experiences.length > 0 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addExperience({ push })}
                  className="border-dashed border-2 border-gray-300 hover:border-gray-400"
                >
                  + Add Another Experience
                </Button>
              </div>
            )}
          </div>
        )}
      </FieldArray>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Guidelines:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Add all your relevant professional work experience</li>
          <li>• List experiences in reverse chronological order (latest first)</li>
          <li>• Upload experience certificates or offer letters</li>
          <li>• Supported formats: PDF, JPG, JPEG, PNG (Max 5MB each)</li>
          <li>• Years of experience will be auto-calculated from dates</li>
          <li>• Include internships if they are relevant to the position</li>
        </ul>
      </div>
    </div>
  );
};