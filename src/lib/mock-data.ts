
import { Class, Question, QuizResult } from './types';

export const MOCK_CLASSES: Class[] = [
  { id: 'c1', name: 'Aljabar Dasar', description: 'Mempelajari variabel dan operasi dasar' },
  { id: 'c2', name: 'Geometri 101', description: 'Mempelajari bangun datar dan ruang' },
  { id: 'c3', name: 'Statistika', description: 'Analisis data dan peluang' },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    classId: 'c1',
    statement: 'Jika 2x + 5 = 13, berapakah nilai x?',
    options: ['3', '4', '5', '6'],
    correctAnswerIndex: 1,
    solutionSteps: [
      'Kurangi kedua sisi dengan 5: 2x = 13 - 5',
      '2x = 8',
      'Bagi kedua sisi dengan 2: x = 8 / 2',
      'x = 4'
    ]
  },
  {
    id: 'q2',
    classId: 'c1',
    statement: 'Berapakah hasil dari (3^2) * 2?',
    options: ['12', '18', '9', '15'],
    correctAnswerIndex: 1,
    solutionSteps: [
      'Hitung pangkat terlebih dahulu: 3^2 = 9',
      'Kalikan hasilnya dengan 2: 9 * 2 = 18'
    ]
  },
  {
    id: 'q3',
    classId: 'c2',
    statement: 'Berapa luas segitiga dengan alas 10cm dan tinggi 5cm?',
    options: ['50 cm²', '25 cm²', '15 cm²', '30 cm²'],
    correctAnswerIndex: 1,
    solutionSteps: [
      'Gunakan rumus luas segitiga: 1/2 * alas * tinggi',
      'Luas = 1/2 * 10 * 5',
      'Luas = 5 * 5 = 25'
    ]
  }
];

export const MOCK_RESULTS: QuizResult[] = [
  {
    id: 'r1',
    studentName: 'Budi Santoso',
    classId: 'c1',
    score: 100,
    totalQuestions: 2,
    timestamp: new Date().toISOString(),
    answers: []
  },
  {
    id: 'r2',
    studentName: 'Ani Wijaya',
    classId: 'c1',
    score: 50,
    totalQuestions: 2,
    timestamp: new Date().toISOString(),
    answers: []
  }
];
