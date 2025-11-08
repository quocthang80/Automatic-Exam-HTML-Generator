
import React, { useState, useEffect } from 'react';
import type { Question } from '../types';

interface EditQuestionModalProps {
  question: Question | null;
  onClose: () => void;
  onSave: (updatedQuestion: Question) => void;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({ question, onClose, onSave }) => {
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  if (!editedQuestion) {
    return null;
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedQuestion({ ...editedQuestion, text: e.target.value });
  };
  
  const handleOptionChange = (index: number, value: string) => {
    if (editedQuestion.options) {
        const newOptions = [...editedQuestion.options];
        newOptions[index] = value;
        setEditedQuestion({ ...editedQuestion, options: newOptions });
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedQuestion({ ...editedQuestion, answer: e.target.value });
  };
  
  const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedQuestion({ ...editedQuestion, explanation: e.target.value });
  };

  const handleSave = () => {
    if (editedQuestion) {
      onSave(editedQuestion);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chỉnh sửa câu hỏi {editedQuestion.id}</h2>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nội dung câu hỏi</label>
                <textarea
                value={editedQuestion.text}
                onChange={handleTextChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            {editedQuestion.type === 'multiple_choice' && editedQuestion.options && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Các lựa chọn</label>
                    {editedQuestion.options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
                        />
                    ))}
                </div>
            )}

            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Đáp án</label>
                 <input
                    type="text"
                    value={editedQuestion.answer}
                    onChange={handleAnswerChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giải thích</label>
                <textarea
                value={editedQuestion.explanation || ''}
                onChange={handleExplanationChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            {/* TODO: Add editing for other question types */}
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                onClick={handleSave}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
            Lưu
            </button>
            <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
            >
            Hủy
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
