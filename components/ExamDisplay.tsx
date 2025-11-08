
import React, { useState, useEffect } from 'react';
import type { Exam, Question } from '../types';
import { generateJsonFile, generateDocxFile, generateHtmlFile } from '../utils/exportUtils';
import { DownloadIcon, EditIcon } from './Icons';
import EditQuestionModal from './EditQuestionModal';

interface ExamDisplayProps {
  examData: Exam;
  onUpdateExam: (updatedExam: Exam) => void;
}

const ExamDisplay: React.FC<ExamDisplayProps> = ({ examData, onUpdateExam }) => {
    const [isAnswerKeyVisible, setIsAnswerKeyVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

    // Re-render MathJax when exam data changes
    useEffect(() => {
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }
    }, [examData]);

    const handleSaveQuestion = (updatedQuestion: Question) => {
        const newQuestions = examData.questions.map(q => 
            q.id === updatedQuestion.id ? updatedQuestion : q
        );
        onUpdateExam({ ...examData, questions: newQuestions });
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {editingQuestion && (
                <EditQuestionModal 
                    question={editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    onSave={handleSaveQuestion}
                />
            )}
            <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{examData.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {examData.metadata.duration} | {examData.metadata.numQuestions} câu hỏi
                </p>
                <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-1">{examData.metadata.instructions}</p>
            </div>
            
            <div className="flex justify-between items-center mb-4">
                 <button 
                    onClick={() => setIsAnswerKeyVisible(!isAnswerKeyVisible)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    {isAnswerKeyVisible ? 'Ẩn Đáp Án' : 'Hiện Đáp Án'}
                </button>
                <div className="relative">
                    <div>
                        <button 
                            onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                        >
                            <DownloadIcon />
                            <span className="ml-2">Tải xuống</span>
                        </button>
                        {isDownloadMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
                                <a onClick={() => { generateJsonFile(examData); setIsDownloadMenuOpen(false); }} className="cursor-pointer block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">JSON</a>
                                <a onClick={() => { generateDocxFile(examData); setIsDownloadMenuOpen(false); }} className="cursor-pointer block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">DOCX</a>
                                <a onClick={() => { generateHtmlFile(examData); setIsDownloadMenuOpen(false); }} className="cursor-pointer block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">HTML tương tác</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {examData.questions.map((q, index) => (
                    <div key={q.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative group">
                        <button onClick={() => setEditingQuestion(q)} className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditIcon />
                        </button>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                            <strong>Câu {index + 1}:</strong> {q.text}
                        </p>
                        {q.type === 'multiple_choice' && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {q.options.map((opt, i) => <p key={i} className="text-gray-700 dark:text-gray-300">{opt}</p>)}
                            </div>
                        )}
                        {q.type === 'true_false' && q.sub_questions && (
                            <div className="mt-2 pl-4 space-y-2">
                                {q.sub_questions.map(sub => (
                                    <div key={sub.id}>
                                       <p className="text-gray-700 dark:text-gray-300">{sub.id}) {sub.text}</p>
                                        {isAnswerKeyVisible && (
                                            <div className="mt-1 p-2 bg-green-50 dark:bg-green-900 border-l-4 border-green-500 rounded-r-md">
                                                <p className="text-sm font-bold text-green-800 dark:text-green-200">Đáp án: {sub.answer}</p>
                                                {sub.explanation && <p className="text-sm text-green-700 dark:text-green-300 mt-1"><strong>Giải thích:</strong> {sub.explanation}</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isAnswerKeyVisible && q.type !== 'true_false' && (
                           <div className="mt-2 p-3 bg-green-50 dark:bg-green-900 border-l-4 border-green-500 rounded-r-md">
                                <p className="text-sm font-bold text-green-800 dark:text-green-200">
                                    {q.type === 'essay' ? 'Gợi ý đáp án: ' : 'Đáp án: '}
                                    {q.answer}
                                </p>
                               {q.explanation && <p className="text-sm text-green-700 dark:text-green-300 mt-1"><strong>Giải thích:</strong> {q.explanation}</p>}
                           </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamDisplay;