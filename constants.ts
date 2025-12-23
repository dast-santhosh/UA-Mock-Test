
import { Question, QuestionType, QuestionDifficulty } from './types';

export const MOCK_EXAM_INFO = {
  candidateName: "[Your Name]",
  examName: "JEE-Main",
  subjectName: "PAPER 1 12-01-2019 MORNING",
  totalTime: 180 * 60, // 3 hours
};

export const MOCK_QUESTIONS: Question[] = Array.from({ length: 90 }, (_, i) => {
  const subjectIndex = Math.floor(i / 30);
  const subjects: ('Physics' | 'Chemistry' | 'Mathematics' | 'Aptitude' | 'Drawing/Planning')[] = ['Physics', 'Chemistry', 'Mathematics'];
  const subject = subjects[subjectIndex] || 'Physics';
  const localIndex = i % 30;
  const type = localIndex < 20 ? QuestionType.MCQ : QuestionType.NAT;
  const section = localIndex < 20 ? 'A' : 'B';
  const difficulty = i % 3 === 0 ? QuestionDifficulty.EASY : i % 3 === 1 ? QuestionDifficulty.MEDIUM : QuestionDifficulty.HARD;

  let text = `This is a sample JEE question ${i + 1} for ${subject}.`;
  let options: string[] | undefined = undefined;

  if (subject === 'Mathematics') {
    text = `Solve the integral: $$\\int_0^\\infty e^{-x^2} dx$$ if it is given that the function is continuous.`;
    if (type === QuestionType.MCQ) {
      options = ["$\\sqrt{\\pi}$", "$\\frac{\\sqrt{\\pi}}{2}$", "$\\pi$", "$\\frac{\\pi}{2}$"];
    }
  } else if (subject === 'Physics') {
    text = `A particle of mass $m$ moves in a circle of radius $r$ with angular velocity $\\omega$. The centripetal force is given by:`;
    if (type === QuestionType.MCQ) {
      options = ["$m \\omega^2 r$", "$m \\omega r^2$", "$m \\omega r$", "$m^2 \\omega r$"];
    }
  }

  return {
    id: i + 1,
    subject,
    type,
    difficulty,
    section,
    text,
    options,
    correctAnswer: type === QuestionType.MCQ ? "0" : "1.77"
  };
});
