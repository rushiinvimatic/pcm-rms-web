import { Field } from 'formik';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../utils/cn';
import type { ApplicationFormInput } from '../../types/application';

interface AddressStepProps {
  values: ApplicationFormInput;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

export const AddressStep = ({ values, errors, touched, setFieldValue }: AddressStepProps) => {
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

  const handleSameAsPermanentChange = (checked: boolean) => {
    setFieldValue('sameAsPermanent', checked);
    
    if (checked && values.permanentAddress) {
      // Copy permanent address to current address
      setFieldValue('currentAddress', { ...values.permanentAddress });
    } else {
      // Clear current address
      setFieldValue('currentAddress', {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: 'Maharashtra',
        country: 'India',
        pinCode: '',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
        <p className="text-gray-600 mt-1">Please provide your permanent and current address details.</p>
      </div>

      {/* Permanent Address */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2">
          Permanent Address <span className="text-red-500">*</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.addressLine1" className="text-gray-700 font-medium">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Field name="permanentAddress.addressLine1">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="permanentAddress.addressLine1"
                  type="text"
                  placeholder="Flat/House Number, Building Name"
                  className={cn(
                    getFieldError('permanentAddress.addressLine1') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300'
                  )}
                />
              )}
            </Field>
            {getFieldError('permanentAddress.addressLine1') && (
              <p className="text-red-500 text-sm">{getFieldError('permanentAddress.addressLine1')}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.addressLine2" className="text-gray-700 font-medium">
              Address Line 2
            </Label>
            <Field name="permanentAddress.addressLine2">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="permanentAddress.addressLine2"
                  type="text"
                  placeholder="Street, Area"
                  className="border-gray-300"
                />
              )}
            </Field>
          </div>

          {/* Address Line 3 */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.addressLine3" className="text-gray-700 font-medium">
              Address Line 3
            </Label>
            <Field name="permanentAddress.addressLine3">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="permanentAddress.addressLine3"
                  type="text"
                  placeholder="Landmark"
                  className="border-gray-300"
                />
              )}
            </Field>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.city" className="text-gray-700 font-medium">
              City <span className="text-red-500">*</span>
            </Label>
            <Field name="permanentAddress.city">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="permanentAddress.city"
                  type="text"
                  placeholder="Enter city"
                  className={cn(
                    getFieldError('permanentAddress.city') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300'
                  )}
                />
              )}
            </Field>
            {getFieldError('permanentAddress.city') && (
              <p className="text-red-500 text-sm">{getFieldError('permanentAddress.city')}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.state" className="text-gray-700 font-medium">
              State <span className="text-red-500">*</span>
            </Label>
            <Field name="permanentAddress.state">
              {({ field }: any) => (
                <select
                  {...field}
                  id="permanentAddress.state"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                    getFieldError('permanentAddress.state') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <option value="Maharashtra">Maharashtra</option>
                  {/* Add more states as needed */}
                </select>
              )}
            </Field>
            {getFieldError('permanentAddress.state') && (
              <p className="text-red-500 text-sm">{getFieldError('permanentAddress.state')}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.country" className="text-gray-700 font-medium">
              Country <span className="text-red-500">*</span>
            </Label>
            <Field name="permanentAddress.country">
              {({ field }: any) => (
                <select
                  {...field}
                  id="permanentAddress.country"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                    getFieldError('permanentAddress.country') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <option value="India">India</option>
                  {/* Add more countries as needed */}
                </select>
              )}
            </Field>
            {getFieldError('permanentAddress.country') && (
              <p className="text-red-500 text-sm">{getFieldError('permanentAddress.country')}</p>
            )}
          </div>

          {/* PIN Code */}
          <div className="space-y-2">
            <Label htmlFor="permanentAddress.pinCode" className="text-gray-700 font-medium">
              PIN Code <span className="text-red-500">*</span>
            </Label>
            <Field name="permanentAddress.pinCode">
              {({ field }: any) => (
                <Input
                  {...field}
                  id="permanentAddress.pinCode"
                  type="text"
                  placeholder="Enter 6-digit PIN code"
                  maxLength={6}
                  className={cn(
                    getFieldError('permanentAddress.pinCode') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300'
                  )}
                />
              )}
            </Field>
            {getFieldError('permanentAddress.pinCode') && (
              <p className="text-red-500 text-sm">{getFieldError('permanentAddress.pinCode')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Same as Permanent Address Checkbox */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        <Checkbox
          id="sameAsPermanent"
          checked={values.sameAsPermanent}
          onCheckedChange={handleSameAsPermanentChange}
        />
        <Label htmlFor="sameAsPermanent" className="text-gray-700 font-medium cursor-pointer">
          Current address is same as permanent address
        </Label>
      </div>

      {/* Current Address */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2">
          Current Address <span className="text-red-500">*</span>
        </h4>
        
        {values.sameAsPermanent ? (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              Current address will be same as permanent address.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.addressLine1" className="text-gray-700 font-medium">
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Field name="currentAddress.addressLine1">
                {({ field }: any) => (
                  <Input
                    {...field}
                    id="currentAddress.addressLine1"
                    type="text"
                    placeholder="Flat/House Number, Building Name"
                    className={cn(
                      getFieldError('currentAddress.addressLine1') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300'
                    )}
                  />
                )}
              </Field>
              {getFieldError('currentAddress.addressLine1') && (
                <p className="text-red-500 text-sm">{getFieldError('currentAddress.addressLine1')}</p>
              )}
            </div>

            {/* Current Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.addressLine2" className="text-gray-700 font-medium">
                Address Line 2
              </Label>
              <Field name="currentAddress.addressLine2">
                {({ field }: any) => (
                  <Input
                    {...field}
                    id="currentAddress.addressLine2"
                    type="text"
                    placeholder="Street, Area"
                    className="border-gray-300"
                  />
                )}
              </Field>
            </div>

            {/* Current Address Line 3 */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.addressLine3" className="text-gray-700 font-medium">
                Address Line 3
              </Label>
              <Field name="currentAddress.addressLine3">
                {({ field }: any) => (
                  <Input
                    {...field}
                    id="currentAddress.addressLine3"
                    type="text"
                    placeholder="Landmark"
                    className="border-gray-300"
                  />
                )}
              </Field>
            </div>

            {/* Current City */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.city" className="text-gray-700 font-medium">
                City <span className="text-red-500">*</span>
              </Label>
              <Field name="currentAddress.city">
                {({ field }: any) => (
                  <Input
                    {...field}
                    id="currentAddress.city"
                    type="text"
                    placeholder="Enter city"
                    className={cn(
                      getFieldError('currentAddress.city') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300'
                    )}
                  />
                )}
              </Field>
              {getFieldError('currentAddress.city') && (
                <p className="text-red-500 text-sm">{getFieldError('currentAddress.city')}</p>
              )}
            </div>

            {/* Current State */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.state" className="text-gray-700 font-medium">
                State <span className="text-red-500">*</span>
              </Label>
              <Field name="currentAddress.state">
                {({ field }: any) => (
                  <select
                    {...field}
                    id="currentAddress.state"
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                      getFieldError('currentAddress.state') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    {/* Add more states as needed */}
                  </select>
                )}
              </Field>
              {getFieldError('currentAddress.state') && (
                <p className="text-red-500 text-sm">{getFieldError('currentAddress.state')}</p>
              )}
            </div>

            {/* Current Country */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.country" className="text-gray-700 font-medium">
                Country <span className="text-red-500">*</span>
              </Label>
              <Field name="currentAddress.country">
                {({ field }: any) => (
                  <select
                    {...field}
                    id="currentAddress.country"
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                      getFieldError('currentAddress.country') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <option value="India">India</option>
                    {/* Add more countries as needed */}
                  </select>
                )}
              </Field>
              {getFieldError('currentAddress.country') && (
                <p className="text-red-500 text-sm">{getFieldError('currentAddress.country')}</p>
              )}
            </div>

            {/* Current PIN Code */}
            <div className="space-y-2">
              <Label htmlFor="currentAddress.pinCode" className="text-gray-700 font-medium">
                PIN Code <span className="text-red-500">*</span>
              </Label>
              <Field name="currentAddress.pinCode">
                {({ field }: any) => (
                  <Input
                    {...field}
                    id="currentAddress.pinCode"
                    type="text"
                    placeholder="Enter 6-digit PIN code"
                    maxLength={6}
                    className={cn(
                      getFieldError('currentAddress.pinCode') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300'
                    )}
                  />
                )}
              </Field>
              {getFieldError('currentAddress.pinCode') && (
                <p className="text-red-500 text-sm">{getFieldError('currentAddress.pinCode')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Important Notes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Address should match your official documents</li>
          <li>• PIN Code should be valid 6-digit code</li>
          <li>• Current address will be used for correspondence</li>
          <li>• Permanent address will be used for verification purposes</li>
        </ul>
      </div>
    </div>
  );
};