export interface Dashboard {
  profileSummary: ProfileSummary;
  statistics: Statistics;
  quickActions: QuickAction[];
  recentActivity: RecentActivity;
  atsScore: AtsScore;
}

export interface ProfileSummary {
  fullName: string;
  professionalTitle: string;
  location: string;
  email: string;
  phone: string;
  professionalSummary: string;
  profileCompletion: number;
}

export interface Statistics {
  totalExperiences: number;
  totalSkills: number;
  totalEducations: number;
  totalCertifications: number;
  totalLanguages: number;
  currentExperiences: number;
  skillsByCategory: number;
}

export interface QuickAction {
  title: string;
  description: string;
  action: string;
  icon: string;
  priority: number;
}

export interface RecentActivity {
  activities: Activity[];
}

export interface Activity {
  type: string;
  description: string;
  date: string;
  entityId: string;
}

export interface AtsScore {
  score: number;
  level: string;
  suggestions: string[];
}