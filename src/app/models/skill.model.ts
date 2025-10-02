export interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
  yearsOfExperience: number;
}

export interface SkillRequest {
  name: string;
  category: string;
  level: string;
  yearsOfExperience: number;
}