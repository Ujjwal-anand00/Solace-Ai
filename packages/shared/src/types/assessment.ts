/**
 * Assessment types and structures.
 * Assessments are strictly informational self-reflection check-ins and non-diagnostic.
 */

export type AssessmentType = 'stress' | 'sleep' | 'energy' | 'emotional-wellbeing' | string;

export interface AssessmentOption {
  value: number;
  label: string;
  description?: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  subtitle?: string;
  options: AssessmentOption[];
}

export interface AssessmentTypeMetadata {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedMinutes: number;
  icon: string;
  category: string;
  questionsVersion: string;
  disclaimer: string;
  questionCount: number;
  questions?: AssessmentQuestion[];
}

export interface AssessmentAnswer {
  questionId: string;
  selectedOption: number;
}

export interface Assessment {
  id: string;
  userId: string;
  assessmentType: AssessmentType;
  questionsVersion: string;
  answers: AssessmentAnswer[];
  score: number;
  maxScore: number;
  resultCategory: string;
  interpretation: string;
  suggestedActivities: string[];
  recommendedNextSteps: string[];
  disclaimer: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitAssessmentDto {
  answers: AssessmentAnswer[];
  questionsVersion?: string;
}
