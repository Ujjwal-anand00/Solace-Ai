import { z } from 'zod';

export const submitAssessmentSchema = z.object({
  questionsVersion: z.string().optional().default('1.0'),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, 'Question ID is required'),
        selectedOption: z
          .number()
          .int()
          .min(0, 'Option must be at least 0')
          .max(3, 'Option cannot exceed 3'),
      }),
    )
    .min(1, 'At least one answer is required'),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;

