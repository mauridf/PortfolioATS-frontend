export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  employmentType: string;
  skillIds: string[];
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
  yearsOfExperience: number;
}

export interface ExperienceRequest {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  employmentType: string;
  skillIds: string[];
}