import React, { useState } from 'react';
import type { ExamFormData, Difficulty, QuestionType } from '../types';
import { SparklesIcon } from './Icons';


interface ExamFormProps {
  onGenerate: (formData: ExamFormData) => void;
  isLoading: boolean;
}

const ExamForm: React.FC<ExamFormProps> = ({ onGenerate, isLoading }) => {
  const [numQuestions, setNumQuestions] = useState<number>(3);
  const [subject, setSubject] = useState<string>('Hóa học');
  const [grade, setGrade] = useState<string>('Lớp 12');
  const [difficulty, setDifficulty] = useState<Difficulty>('trung bình');
  const [questionType, setQuestionType] = useState<QuestionType>('trắc nghiệm');
  const [randomize, setRandomize] = useState<boolean>(true);
  const [pastedText, setPastedText] = useState<string>('');
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ numQuestions, subject, grade, difficulty, questionType, randomize, pastedText, includeExplanations });
  };

  const formElementClass = "mb-4";
  const labelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-white";
  const inputClass = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tùy chỉnh đề thi</h2>
      <form onSubmit={handleSubmit}>
        <div className={formElementClass}>
          <label htmlFor="subject" className={labelClass}>Môn học</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            placeholder="ví dụ: Hóa học, Vật lý..."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className={formElementClass}>
                <label htmlFor="numQuestions" className={labelClass}>Số câu hỏi</label>
                <input
                    type="number"
                    id="numQuestions"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className={inputClass}
                    min="1"
                    max="50"
                    required
                />
            </div>
            <div className={formElementClass}>
                <label htmlFor="grade" className={labelClass}>Lớp</label>
                <select
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className={inputClass}
                >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Khác">Khác</option>
                </select>
            </div>
        </div>
        <div className={formElementClass}>
          <label htmlFor="difficulty" className={labelClass}>Độ khó</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className={inputClass}
          >
            <option value="dễ">Dễ</option>
            <option value="trung bình">Trung bình</option>
            <option value="khó">Khó</option>
          </select>
        </div>
        <div className={formElementClass}>
          <label htmlFor="questionType" className={labelClass}>Loại câu hỏi</label>
          <select
            id="questionType"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            className={inputClass}
          >
            <option value="trắc nghiệm">Trắc nghiệm</option>
            <option value="đúng sai">Đúng / Sai</option>
            <option value="điền khuyết">Điền khuyết</option>
            <option value="tự luận">Tự luận</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <input id="randomize-checkbox" type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="randomize-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Trộn câu hỏi</label>
            </div>
            <div className="flex items-center">
                <input id="explanation-checkbox" type="checkbox" checked={includeExplanations} onChange={(e) => setIncludeExplanations(e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="explanation-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Bao gồm giải thích</label>
            </div>
        </div>


        <div className={`${formElementClass} border-t border-gray-200 dark:border-gray-700 pt-4`}>
          <label htmlFor="pastedText" className={labelClass}>
            Hoặc dán câu hỏi vào đây
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400"> (AI sẽ chuyển đổi chúng)</span>
          </label>
          <textarea
            id="pastedText"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className={inputClass}
            rows={6}
            placeholder="Dán văn bản câu hỏi của bạn ở đây. AI sẽ tự động phân tích và định dạng chúng. Nếu bạn dán câu hỏi, các tùy chọn ở trên sẽ được dùng làm gợi ý."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-500 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            'Đang tạo...'
          ) : (
            <>
              <SparklesIcon/>
              <span className="ml-2">Tạo Đề Thi</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExamForm;