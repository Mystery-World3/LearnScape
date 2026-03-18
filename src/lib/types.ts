export type Class = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Question = {
  id: string;
  classId: string;
  statement: string;
  options: string[];
  correctAnswerIndex: number;
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
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
};
