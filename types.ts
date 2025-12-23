
export enum QuestionStatus {
  NOT_VISITED = 'NOT_VISITED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  ANSWERED = 'ANSWERED',
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW',
  ANSWERED_AND_MARKED_FOR_REVIEW = 'ANSWERED_AND_MARKED_FOR_REVIEW',
}

export enum QuestionType {
  MCQ = 'MCQ',
  NAT = 'NAT', // Numerical Answer Type
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Question {
  id: number;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Aptitude' | 'Drawing/Planning';
  type: QuestionType;
  difficulty: QuestionDifficulty;
  section: 'A' | 'B'; // A = 20 MCQs, B = 10 NATs
  text: string;
  options?: string[]; // Only for MCQ
  correctAnswer: string; // Index for MCQ (0-3), or numerical value for NAT
}

export interface QuestionState {
  status: QuestionStatus;
  selectedOption?: number; // For MCQ
  numericalAnswer?: string; // For NAT
}

export interface Exam {
  id: string;
  name: string;
  durationMinutes: number;
  questions: Question[];
  createdAt: number;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

export interface TestResult {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

export enum SubmissionStage {
  IDLE = '',
  AUDITING = 'Auditing...',
  MATCHING = 'Matching Answers...',
  CALCULATING = 'Calculating Scores...',
  SYNCING = 'Syncing Records...',
  FINALIZING = 'Finalizing...'
}

export type AppView = 'LANDING' | 'ADMIN_LOGIN' | 'STUDENT_LOGIN' | 'ADMIN_DASHBOARD' | 'TEST_EDITOR' | 'TEST_INTERFACE' | 'RESULT_SUMMARY';
