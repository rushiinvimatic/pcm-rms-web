import { Field } from 'formik';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../utils/cn';
import { 
  POSITION_LABELS, 
  GENDER_LABELS, 
  BLOOD_GROUPS,
  type ApplicationFormInput 
} from '../../types/application';
import { PositionRequirements } from './PositionRequirements';
import { getRegistrationFee, getRegistrationFeeDescription } from '../../constants/registrationFees';
import { IndianRupee } from 'lucide-react';

interface PersonalInfoStepProps {
  values: ApplicationFormInput;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
}) => {
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
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        <p className="text-gray-600 mt-1">Please provide your basic personal details and select your position.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="positionType" className="text-gray-700 font-medium">
          Position <span className="text-red-500">*</span>
        </Label>
        <Field name="positionType">
          {({ field }: any) => (
            <select
              {...field}
              id="positionType"
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                getFieldError('positionType') 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 hover:border-gray-400'
              )}
              onChange={(e) => {
                setFieldValue('positionType', e.target.value);
              }}
            >
              <option value="">Select Position</option>
              {Object.entries(POSITION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </Field>
        {getFieldError('positionType') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('positionType')}</p>
        )}
      </div>

      {values.positionType && (
        <>
        {/* Registration Fee Display */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-1">
              <h4 className="text-md font-semibold text-green-800">Registration Fee</h4>
            </div>
            <div className="mt-2">
              <p className="text-lg font-bold text-green-900">
                {getRegistrationFeeDescription(parseInt(values.positionType))}
              </p>
              {getRegistrationFee(parseInt(values.positionType)) > 0 && (
                <p className="text-xs text-green-700 mt-1">
                  This fee will be charged during the payment stage after your application is approved.
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <PositionRequirements 
              positionId={parseInt(values.positionType)} 
              className="bg-blue-50 p-4 rounded-lg"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-gray-700 font-medium">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Field name="firstName">
            {({ field }: any) => (
              <Input
                {...field}
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                className={cn(
                  getFieldError('firstName') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('firstName') && (
            <p className="text-red-500 text-sm">{getFieldError('firstName')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName" className="text-gray-700 font-medium">
            Middle Name
          </Label>
          <Field name="middleName">
            {({ field }: any) => (
              <Input
                {...field}
                id="middleName"
                type="text"
                placeholder="Enter your middle name"
                className="border-gray-300"
              />
            )}
          </Field>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-gray-700 font-medium">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Field name="lastName">
            {({ field }: any) => (
              <Input
                {...field}
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                className={cn(
                  getFieldError('lastName') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('lastName') && (
            <p className="text-red-500 text-sm">{getFieldError('lastName')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherName" className="text-gray-700 font-medium">
            Mother's Name <span className="text-red-500">*</span>
          </Label>
          <Field name="motherName">
            {({ field }: any) => (
              <Input
                {...field}
                id="motherName"
                type="text"
                placeholder="Enter your mother's name"
                className={cn(
                  getFieldError('motherName') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('motherName') && (
            <p className="text-red-500 text-sm">{getFieldError('motherName')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber" className="text-gray-700 font-medium">
            Mobile Number <span className="text-red-500">*</span>
          </Label>
          <Field name="mobileNumber">
            {({ field }: any) => (
              <Input
                {...field}
                id="mobileNumber"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={cn(
                  getFieldError('mobileNumber') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('mobileNumber') && (
            <p className="text-red-500 text-sm">{getFieldError('mobileNumber')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailAddress" className="text-gray-700 font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Field name="emailAddress">
            {({ field }: any) => (
              <Input
                {...field}
                id="emailAddress"
                type="email"
                placeholder="Enter your email address"
                className={cn(
                  getFieldError('emailAddress') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('emailAddress') && (
            <p className="text-red-500 text-sm">{getFieldError('emailAddress')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Field name="dateOfBirth">
            {({ field }: any) => (
              <Input
                {...field}
                id="dateOfBirth"
                type="date"
                className={cn(
                  getFieldError('dateOfBirth') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('dateOfBirth') && (
            <p className="text-red-500 text-sm">{getFieldError('dateOfBirth')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-gray-700 font-medium">
            Gender <span className="text-red-500">*</span>
          </Label>
          <Field name="gender">
            {({ field }: any) => (
              <select
                {...field}
                id="gender"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                  getFieldError('gender') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <option value="">Select Gender</option>
                {Object.entries(GENDER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {getFieldError('gender') && (
            <p className="text-red-500 text-sm">{getFieldError('gender')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="text-gray-700 font-medium">
            Height (in cm) <span className="text-red-500">*</span>
          </Label>
          <Field name="height">
            {({ field }: any) => (
              <Input
                {...field}
                id="height"
                type="number"
                placeholder="Enter height in centimeters"
                min="100"
                max="250"
                className={cn(
                  getFieldError('height') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300'
                )}
              />
            )}
          </Field>
          {getFieldError('height') && (
            <p className="text-red-500 text-sm">{getFieldError('height')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodGroup" className="text-gray-700 font-medium">
            Blood Group <span className="text-red-500">*</span>
          </Label>
          <Field name="bloodGroup">
            {({ field }: any) => (
              <select
                {...field}
                id="bloodGroup"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                  getFieldError('bloodGroup') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {getFieldError('bloodGroup') && (
            <p className="text-red-500 text-sm">{getFieldError('bloodGroup')}</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Important Notes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li> Please ensure all information matches your official documents</li>
          <li> Fields marked with * are mandatory</li>
          <li> Mobile number should be active for OTP verification</li>
          <li> Email address will be used for official communications</li>
        </ul>
      </div>
    </div>
  );
};
