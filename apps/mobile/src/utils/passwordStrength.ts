export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  level: PasswordStrengthLevel;
  label: string;
  color: string;
  feedback: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: 'weak',
      label: 'Too short',
      color: '#E34234', // Bold Red
      feedback: 'Password must be at least 8 characters.',
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Normalize score to max 4
  const finalScore = Math.min(Math.max(score - (password.length < 8 ? 2 : 0), 1), 4);

  switch (finalScore) {
    case 1:
      return {
        score: 1,
        level: 'weak',
        label: 'Weak',
        color: '#E34234', // Bold Red
        feedback: 'Use at least 8 characters with letters and numbers.',
      };
    case 2:
      return {
        score: 2,
        level: 'fair',
        label: 'Fair',
        color: '#D99A36', // warning amber
        feedback: 'Add uppercase letters or special characters to strengthen.',
      };
    case 3:
      return {
        score: 3,
        level: 'good',
        label: 'Good',
        color: '#9678BD', // primary lavender dark
        feedback: 'Solid password! Meets all standard security guidelines.',
      };
    case 4:
    default:
      return {
        score: 4,
        level: 'strong',
        label: 'Strong',
        color: '#41865B', // success green
        feedback: 'Excellent! Your account is safe and well protected.',
      };
  }
}

