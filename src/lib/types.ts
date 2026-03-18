export type Class = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type QuestionType = 'multiple-choice' | 'number' | 'text';

export type Question = {
  id: string;
  classId: string;
  statement: string;
  type: QuestionType;
  options?: string[]; // Hanya untuk multiple-choice
  correctAnswerIndex?: number; // Hanya untuk multiple-choice
  correctAnswer?: string; // Untuk tipe number dan text
  solutionSteps: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type QuizResult = {
  id: string;
  studentName: string;
  classId: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  answers: {
    questionId: string;
    selectedOptionIndex?: number;
    studentAnswer?: string;
    isCorrect: boolean;
  }[];
};
