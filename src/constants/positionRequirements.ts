export interface PositionRequirement {
  id: number;
  name: string;
  fees: string;
  qualifications: string[];
  duties: string[];
  requiredDocuments: string[];
}

export const POSITION_REQUIREMENTS: Record<number, PositionRequirement> = {
  0: {
    id: 0,
    name: 'Architect',
    fees: '1500 for 3 years',
    qualifications: [
      '(A) Three years architectural assistantship or intermediate in architecture with two years experience, or',
      '(B) Diploma in Civil engineering or equivalent qualifications with two years experience.',
      '(C) Draftsman in Civil Engineering from ITI or equivalent qualifications with ten years experience, out of which five years shall be under Architect/Engineer. (AS PER DCPR RULE C-5.1.a).',
      'II. (A) All plans and related information connected with development permission on a plot up to 500 sq.m.',
      '(B) Certificate of supervision of buildings on a plot up to 500 sq. m. and completion thereof. (AS PER DCPR RULE C-5.2.a).'
    ],
    duties: [
      '(1) It will be incumbent on every architect / licensed technical personnel, in all matters in which he may be professionally consulted or engaged, to assist and co-operate with the Metropolitan Commissioner and other Officers in carrying out and enforcing the provisions of Maharashtra Regional & Town Planning Act, 1966 and of any regulations for the time being in force under the same.',
      '(2) Every architect / licensed technical personnel shall be responsible for due compliance with the provisions of Maharashtra Regional & Town Planning Act, 1966 and of any regulations for the time being in force under the said Act. It shall be obligatory on him to satisfy himself that a qualified and competent Mistry or Inspector of Works is constantly employed and present on the work to supervise the execution of all work and to prevent the use of any defective material therein and the improper execution of any such work.',
      '(3) Every architect / licensed technical personnel shall be responsible for carrying out work according to the sanctioned plan.',
      '(4) Every architect / licensed technical personnel shall be responsible for correctness of the calculations and dimensions mentioned on the plan and shall be liable for consequences arising thereof.',
      '(5) Architect / licensed technical personnel shall not involve himself in any unauthorised development. He shall also make the client aware of legal provisions in respect of proposed development and consequences thereof.',
      '(6) When an architect / licensed technical personnel ceases to be in the employment for the development work, he shall report the fact forthwith to the Metropolitan Commissioner. (AS PER DCPR RULE C-6.3).'
    ],
    requiredDocuments: [
      '1. Diploma / ITI certificate',
      '2. Marksheet',
      '3. Experience certificate',
      '   a. 1) Diploma in Civil/Equivalent - 2 years experience',
      '   b. 2) I.T.I in Civil/Equivalent - 10 years experience',
      '4. Address Proof',
      '5. Identity Proof',
      '6. Self Declaration form + Photo'
    ]
  },
  1: {
    id: 1,
    name: 'Structural Engineer',
    fees: '2000 for 3 years',
    qualifications: [
      '(A) Bachelor\'s degree in Civil Engineering or equivalent with specialization in Structural Engineering',
      '(B) Minimum 5 years of experience in structural design and analysis',
      '(C) Valid license from Council of Architecture or equivalent professional body',
      'II. (A) Structural design and analysis for buildings up to G+4 floors',
      '(B) Supervision of structural works and quality control'
    ],
    duties: [
      '(1) Responsible for structural design and analysis of buildings',
      '(2) Ensure compliance with IS codes and structural safety norms',
      '(3) Supervise structural construction activities',
      '(4) Review and approve structural drawings and calculations',
      '(5) Coordinate with architects and other consultants',
      '(6) Report any structural defects or non-compliance to authorities'
    ],
    requiredDocuments: [
      '1. Engineering Degree Certificate',
      '2. Final Year Marksheet',
      '3. Experience Certificate (minimum 5 years)',
      '4. Professional License',
      '5. Address Proof',
      '6. Identity Proof',
      '7. Self Declaration form + Photo'
    ]
  },
  2: {
    id: 2,
    name: 'Licence Engineer',
    fees: '1800 for 3 years',
    qualifications: [
      '(A) Bachelor\'s degree in Civil Engineering or equivalent',
      '(B) Minimum 3 years of relevant experience',
      '(C) Valid professional license',
      'II. (A) Technical supervision of construction activities',
      '(B) Quality assurance and compliance monitoring'
    ],
    duties: [
      '(1) Supervise construction activities as per approved plans',
      '(2) Ensure compliance with building codes and regulations',
      '(3) Monitor quality of construction materials and workmanship',
      '(4) Coordinate with various stakeholders',
      '(5) Submit progress reports and compliance certificates',
      '(6) Address technical issues during construction'
    ],
    requiredDocuments: [
      '1. Engineering Degree Certificate',
      '2. Final Year Marksheet',
      '3. Experience Certificate (minimum 3 years)',
      '4. Professional License',
      '5. Address Proof',
      '6. Identity Proof',
      '7. Self Declaration form + Photo'
    ]
  },
  3: {
    id: 3,
    name: 'Supervisor1',
    fees: '1500 for 3 years',
    qualifications: [
      '(A) Three years architectural assistantship or intermediate in architecture with two years experience, or',
      '(B) Diploma in Civil engineering or equivalent qualifications with two years experience.',
      '(C) Draftsman in Civil Engineering from ITI or equivalent qualifications with ten years experience, out of which five years shall be under Architect/Engineer. (AS PER DCPR RULE C-5.1.a).',
      'II. (A) All plans and related information connected with development permission on a plot up to 500 sq.m.',
      '(B) Certificate of supervision of buildings on a plot up to 500 sq. m. and completion thereof. (AS PER DCPR RULE C-5.2.a).'
    ],
    duties: [
      '(1) It will be incumbent on every architect / licensed technical personnel, in all matters in which he may be professionally consulted or engaged, to assist and co-operate with the Metropolitan Commissioner and other Officers in carrying out and enforcing the provisions of Maharashtra Regional & Town Planning Act, 1966 and of any regulations for the time being in force under the same.',
      '(2) Every architect / licensed technical personnel shall be responsible for due compliance with the provisions of Maharashtra Regional & Town Planning Act, 1966 and of any regulations for the time being in force under the said Act. It shall be obligatory on him to satisfy himself that a qualified and competent Mistry or Inspector of Works is constantly employed and present on the work to supervise the execution of all work and to prevent the use of any defective material therein and the improper execution of any such work.',
      '(3) Every architect / licensed technical personnel shall be responsible for carrying out work according to the sanctioned plan.',
      '(4) Every architect / licensed technical personnel shall be responsible for correctness of the calculations and dimensions mentioned on the plan and shall be liable for consequences arising thereof.',
      '(5) Architect / licensed technical personnel shall not involve himself in any unauthorised development. He shall also make the client aware of legal provisions in respect of proposed development and consequences thereof.',
      '(6) When an architect / licensed technical personnel ceases to be in the employment for the development work, he shall report the fact forthwith to the Metropolitan Commissioner. (AS PER DCPR RULE C-6.3).'
    ],
    requiredDocuments: [
      '1. Diploma / ITI certificate',
      '2. Marksheet',
      '3. Experience certificate',
      '   a. 1) Diploma in Civil/Equivalent - 2 years experience',
      '   b. 2) I.T.I in Civil/Equivalent - 10 years experience',
      '4. Address Proof',
      '5. Identity Proof',
      '6. Self Declaration form + Photo'
    ]
  },
  4: {
    id: 4,
    name: 'Supervisor2',
    fees: '900 for 3 years',
    qualifications: [
      '(A) Three years architectural assistantship or intermediate in architecture with two years experience, or',
      '(B) Diploma in Civil engineering or equivalent qualifications with two years experience.',
      '(C) Draftsman in Civil Engineering from ITI or equivalent qualifications with ten years experience, out of which five years shall be under Architect/Engineer. (AS PER DCPR RULE C-5.1.a).',
      'II. (A) All plans and related information connected with development permission on a plot up to 500 sq.m.',
      '(B) Certificate of supervision of buildings on a plot up to 500 sq. m. and completion thereof. (AS PER DCPR RULE C-5.2.a).'
    ],
    duties: [
      '(1) It will be incumbent on every architect / licensed technical personnel, in all matters in which he may be professionally consulted or engaged, to assist and co-operate with the Metropolitan Commissioner and other Officers in carrying out and enforcing the provisions of Maharashtra Regional & Town Planning Act, 1966 and of any regulations for the time being in force under the same.',
      '(2) Every architect / licensed technical personnel shall be responsible for due compliance with the provisions of Maharashtra Regional & Town Planning Act, 1966 and of any regulations for the time being in force under the said Act. It shall be obligatory on him to satisfy himself that a qualified and competent Mistry or Inspector of Works is constantly employed and present on the work to supervise the execution of all work and to prevent the use of any defective material therein and the improper execution of any such work.',
      '(3) Every architect / licensed technical personnel shall be responsible for carrying out work according to the sanctioned plan.',
      '(4) Every architect / licensed technical personnel shall be responsible for correctness of the calculations and dimensions mentioned on the plan and shall be liable for consequences arising thereof.',
      '(5) Architect / licensed technical personnel shall not involve himself in any unauthorised development. He shall also make the client aware of legal provisions in respect of proposed development and consequences thereof.',
      '(6) When an architect / licensed technical personnel ceases to be in the employment for the development work, he shall report the fact forthwith to the Metropolitan Commissioner. (AS PER DCPR RULE C-6.3).'
    ],
    requiredDocuments: [
      '1. Diploma / ITI certificate',
      '2. Marksheet',
      '3. Experience certificate',
      '   a. 1) Diploma in Civil/Equivalent - 2 years experience',
      '   b. 2) I.T.I in Civil/Equivalent - 10 years experience',
      '4. Address Proof',
      '5. Identity Proof',
      '6. Self Declaration form + Photo'
    ]
  }
};

export const getPositionRequirement = (positionId: number): PositionRequirement | null => {
  return POSITION_REQUIREMENTS[positionId] || null;
};

export const getPositionName = (positionId: number): string => {
  const requirement = POSITION_REQUIREMENTS[positionId];
  return requirement ? requirement.name : 'Unknown Position';
};

export const getPositionFees = (positionId: number): string => {
  const requirement = POSITION_REQUIREMENTS[positionId];
  return requirement ? requirement.fees : '';
};
