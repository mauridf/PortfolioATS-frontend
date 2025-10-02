// Interfaces principais do Profile
export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
  socialLinks: SocialLink[];
  experiences: any[]; // Usar any[] temporariamente para evitar importação circular
  skills: any[]; // Usar any[] temporariamente
  educations: Education[];
  certifications: Certification[];
  languages: Language[];
}

export interface ProfileRequest {
  fullName: string;
  phone: string;
  location: string;
  professionalSummary: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  username: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCompleted: boolean;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId: string;
  credentialUrl: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}