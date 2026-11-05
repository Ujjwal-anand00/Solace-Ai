/**
 * Assessment results are strictly informational and non-diagnostic.
 */
export interface AssessmentAnswer {
  questionId: string;
  selectedOption: number;
}

export interface Assessment {
  id: string;
  userId: string;
  assessmentType: 'phq-9' | 'gad-7' | 'stress-index' | 'wellbeing-score' | string;
  questionsVersion: string;
  answers: AssessmentAnswer[];
  score: number;
  resultCategory: string;
  interpretation: string;
  disclaimer: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

