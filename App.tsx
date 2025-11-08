
import React, { useState, useCallback } from 'react';
import ExamForm from './components/ExamForm';
import ExamDisplay from './components/ExamDisplay';
import { generateExam } from './services/geminiService';
import type { Exam, ExamFormData } from './types';
import { SparklesIcon } from './components/Icons';


function App() {
  const [examData, setExamData] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateExam = useCallback(async (formData: ExamFormData) => {
    setIsLoading(true);
    setError(null);
    setExamData(null);
    try {
      const data = await generateExam(formData);
      setExamData(data);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleUpdateExam = (updatedExam: Exam) => {
    setExamData(updatedExam);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <SparklesIcon />
            <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">AI Exam Generator</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ExamForm onGenerate={handleGenerateExam} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-2">
            {isLoading && (
              <div className="flex justify-center items-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tạo đề thi, vui lòng đợi...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quá trình này có thể mất một vài phút.</p>
                </div>
              </div>
            )}
            {error && (
              <div className="p-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
                <h3 className="font-bold">Đã xảy ra lỗi</h3>
                <p>{error}</p>
              </div>
            )}
            {examData && !isLoading && (
              <ExamDisplay examData={examData} onUpdateExam={handleUpdateExam} />
            )}
            {!isLoading && !examData && !error && (
                 <div className="flex flex-col justify-center items-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Chào mừng bạn đến với Trình tạo đề thi AI!</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Sử dụng biểu mẫu bên trái để tùy chỉnh và tạo đề thi của bạn. Bạn có thể chỉ định môn học, lớp, độ khó và hơn thế nữa.
                    </p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Sau khi tạo xong, đề thi sẽ xuất hiện ở đây.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
