import React, { useState } from 'react';
import type { ApplicationFormData, Experience, Qualification } from '../../types/application';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { PositionRequirements } from './PositionRequirements';

interface ProfessionalDetailsStepProps {
  data: Partial<ApplicationFormData>;
  onUpdate: (data: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ProfessionalDetailsStep: React.FC<ProfessionalDetailsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const [newQualification, setNewQualification] = useState<Partial<Qualification>>({});
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ Position: e.target.value });
  };

  const handleAddQualification = () => {
    if (Object.keys(newQualification).length < 6) return;
    
    const qualifications = [...(data.qualifications || []), newQualification as Qualification];
    onUpdate({ qualifications });
    setNewQualification({});
  };

  const handleAddExperience = () => {
    if (Object.keys(newExperience).length < 5) return;
    
    const experiences = [...(data.experiences || []), newExperience as Experience];
    onUpdate({ experiences });
    setNewExperience({});
  };

  const removeQualification = (index: number) => {
    const qualifications = data.qualifications?.filter((_, i) => i !== index);
    onUpdate({ qualifications });
  };

  const removeExperience = (index: number) => {
    const experiences = data.experiences?.filter((_, i) => i !== index);
    onUpdate({ experiences });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Position Selection */}
      <div>
        <Label htmlFor="position">Position</Label>
        <select
          id="position"
          name="Position"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={data.Position || ''}
          onChange={handlePositionChange}
          required
        >
          <option value="">Select Position</option>
          <option value="0">Architect</option>
          <option value="1">Structural Engineer</option>
          <option value="2">Licence Engineer</option>
          <option value="3">Supervisor1</option>
          <option value="4">Supervisor2</option>
        </select>
      </div>

      {/* Show position requirements if position is selected */}
      {data.Position && (
        <PositionRequirements 
          positionId={parseInt(data.Position)} 
          className="mb-6"
        />
      )}

      {/* Qualifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Qualifications</h3>
        
        {data.qualifications?.map((qual, index) => (
          <div key={index} className="p-4 border rounded-md relative">
            <button
              type="button"
              onClick={() => removeQualification(index)}
              className="absolute top-2 right-2 text-red-500"
            >
              ×
            </button>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-medium">Degree:</span> {qual.degreeName}
              </p>
              <p>
                <span className="font-medium">Institute:</span> {qual.instituteName}
              </p>
              <p>
                <span className="font-medium">University:</span> {qual.universityName}
              </p>
              <p>
                <span className="font-medium">Passing Year:</span>{' '}
                {new Date(qual.yearOfPassing).getFullYear()}
              </p>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
          <div>
            <Label htmlFor="degreeName">Degree Name</Label>
            <Input
              id="degreeName"
              value={newQualification.degreeName || ''}
              onChange={e => setNewQualification(prev => ({ ...prev, degreeName: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="instituteName">Institute Name</Label>
            <Input
              id="instituteName"
              value={newQualification.instituteName || ''}
              onChange={e => setNewQualification(prev => ({ ...prev, instituteName: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="universityName">University Name</Label>
            <Input
              id="universityName"
              value={newQualification.universityName || ''}
              onChange={e => setNewQualification(prev => ({ ...prev, universityName: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <select
              id="specialization"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newQualification.specialization || ''}
              onChange={e => setNewQualification(prev => ({ ...prev, specialization: parseInt(e.target.value) }))}
            >
              <option value="">Select Specialization</option>
              <option value="0">Architecture</option>
              <option value="1">Civil Engineering</option>
              <option value="2">Structural Engineering</option>
              <option value="3">Construction</option>
              <option value="4">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="passingMonth">Passing Month</Label>
            <select
              id="passingMonth"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newQualification.passingMonth || ''}
              onChange={e => setNewQualification(prev => ({ ...prev, passingMonth: parseInt(e.target.value) }))}
            >
              <option value="">Select Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="yearOfPassing">Year of Passing</Label>
            <Input
              id="yearOfPassing"
              type="date"
              value={newQualification.yearOfPassing || ''}
              onChange={e => setNewQualification(prev => ({ ...prev, yearOfPassing: e.target.value }))}
            />
          </div>

          <div className="col-span-2">
            <Button
              type="button"
              onClick={handleAddQualification}
              className="w-full"
            >
              Add Qualification
            </Button>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Experience</h3>

        {data.experiences?.map((exp, index) => (
          <div key={index} className="p-4 border rounded-md relative">
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="absolute top-2 right-2 text-red-500"
            >
              ×
            </button>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-medium">Company:</span> {exp.companyName}
              </p>
              <p>
                <span className="font-medium">Position:</span> {exp.position}
              </p>
              <p>
                <span className="font-medium">Duration:</span>{' '}
                {new Date(exp.fromDate).toLocaleDateString()} -{' '}
                {new Date(exp.toDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Years:</span> {exp.yearsOfExperience}
              </p>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={newExperience.companyName || ''}
              onChange={e => setNewExperience(prev => ({ ...prev, companyName: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={newExperience.position || ''}
              onChange={e => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="fromDate">From Date</Label>
            <Input
              id="fromDate"
              type="date"
              value={newExperience.fromDate || ''}
              onChange={e => setNewExperience(prev => ({ ...prev, fromDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="toDate">To Date</Label>
            <Input
              id="toDate"
              type="date"
              value={newExperience.toDate || ''}
              onChange={e => setNewExperience(prev => ({ ...prev, toDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Input
              id="yearsOfExperience"
              type="number"
              step="0.5"
              value={newExperience.yearsOfExperience || ''}
              onChange={e => setNewExperience(prev => ({ ...prev, yearsOfExperience: parseFloat(e.target.value) }))}
            />
          </div>

          <div className="col-span-2">
            <Button
              type="button"
              onClick={handleAddExperience}
              className="w-full"
            >
              Add Experience
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button type="submit">
          Next
        </Button>
      </div>
    </form>
  );
};