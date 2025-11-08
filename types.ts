// Add global type declarations for libraries loaded from CDN
declare global {
  interface Window {
    MathJax: any;
    docx: any;
  }
}

export type Difficulty = 'dễ' | 'trung bình' | 'khó';
export type QuestionType = 'trắc nghiệm' | 'đúng sai' | 'điền khuyết' | 'tự luận';

export interface ExamFormData {
  numQuestions: number;
  subject: string;
  grade: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  randomize: boolean;
  pastedText: string;
  includeExplanations: boolean;
}

export interface SubQuestion {
    id: string; // e.g., "a", "b", "c"
    text: string;
    answer: 'Đúng' | 'Sai';
    explanation?: string;
}

export interface Question {
    id: number;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'fill_in_the_blank' | 'essay';
    options?: string[]; // For multiple_choice
    answer: string; // For multiple_choice (e.g., "A"), true_false (e.g., "Đúng"), fill_in_the_blank, essay (suggested answer)
    explanation?: string;
    sub_questions?: SubQuestion[]; // For true_false
}

export interface Exam {
  title: string;
  metadata: {
    duration: string;
    numQuestions: number;
    instructions: string;
  };
  questions: Question[];
}
