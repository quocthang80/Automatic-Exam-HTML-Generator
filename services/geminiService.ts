
import { GoogleGenAI, Type } from "@google/genai";
import type { Exam, ExamFormData } from "../types";

// The guidelines state to use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePrompt = (formData: ExamFormData): string => {
    let prompt = `Tạo một đề thi dựa trên các thông số sau:
- Môn học: ${formData.subject}
- Lớp: ${formData.grade}
- Số lượng câu hỏi: ${formData.numQuestions}
- Độ khó: ${formData.difficulty}
- Loại câu hỏi: ${formData.questionType}
- Ngôn ngữ: Tiếng Việt

Yêu cầu chi tiết:
1.  Tạo một đề thi hoàn chỉnh có tiêu đề, siêu dữ liệu (thời gian làm bài, hướng dẫn) và danh sách câu hỏi.
2.  Thời gian làm bài đề xuất là ${formData.numQuestions * 1.5} phút.
3.  Mỗi câu hỏi phải có ID, nội dung câu hỏi ('text').
4.  Đối với câu hỏi trắc nghiệm ('multiple_choice'), phải có 4 lựa chọn ('options') dạng "A. [Nội dung]", "B. [Nội dung]",... và một đáp án đúng ('answer') chỉ ghi chữ cái (ví dụ: "A").
5.  Đối với câu hỏi Đúng/Sai ('true_false'), câu hỏi chính ('text') là một mệnh đề chung, và có các câu hỏi phụ ('sub_questions') là các mệnh đề nhỏ cần xác định Đúng hay Sai. Mỗi câu hỏi phụ có ID (a, b, c...), văn bản, và đáp án là "Đúng" hoặc "Sai".
6.  Đối với câu hỏi điền khuyết ('fill_in_the_blank'), cung cấp đáp án ('answer') là từ/cụm từ cần điền.
7.  Đối với câu hỏi tự luận ('essay'), cung cấp một câu trả lời gợi ý ('answer').
8.  ${formData.includeExplanations ? "Bắt buộc phải có giải thích ('explanation') chi tiết, rõ ràng cho mỗi câu hỏi (hoặc câu hỏi phụ nếu có)." : "Không cần cung cấp giải thích."}
9.  ${formData.randomize ? "Thứ tự câu hỏi và các lựa chọn (nếu là trắc nghiệm) phải được xáo trộn ngẫu nhiên." : ""}
10. Định dạng đầu ra phải là một đối tượng JSON tuân thủ theo schema đã cung cấp.
11. Đảm bảo nội dung câu hỏi chính xác về mặt chuyên môn, phù hợp với trình độ ${formData.grade}.
12. Các công thức toán học, hóa học phải được viết dưới dạng LaTeX (ví dụ: $H_2O$, $E=mc^2$).
`;

    if (formData.pastedText) {
        prompt += `\n\nDưới đây là một đoạn văn bản do người dùng cung cấp. Hãy sử dụng nó làm ngữ liệu chính để tạo ra các câu hỏi. Nếu văn bản này đã là một danh sách câu hỏi, hãy chuyển đổi nó sang định dạng JSON được yêu cầu, đồng thời áp dụng các tùy chọn ở trên (ví dụ: thêm giải thích, thay đổi loại câu hỏi nếu cần).
\n---VĂN BẢN CUNG CẤP---\n${formData.pastedText}\n----------------------`;
    }

    return prompt;
}

const examSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Tiêu đề của đề thi." },
        metadata: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING, description: "Thời gian làm bài đề xuất (ví dụ: '45 phút')." },
                numQuestions: { type: Type.INTEGER, description: "Tổng số câu hỏi trong đề." },
                instructions: { type: Type.STRING, description: "Hướng dẫn làm bài cho học sinh." },
            },
             required: ["duration", "numQuestions", "instructions"],
        },
        questions: {
            type: Type.ARRAY,
            description: "Danh sách các câu hỏi.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    text: { type: Type.STRING, description: "Nội dung câu hỏi, hỗ trợ LaTeX." },
                    type: { type: Type.STRING, description: "Loại câu hỏi: 'multiple_choice', 'true_false', 'fill_in_the_blank', 'essay'." },
                    options: {
                        type: Type.ARRAY,
                        description: "Danh sách 4 lựa chọn cho câu hỏi trắc nghiệm.",
                        items: { type: Type.STRING }
                    },
                    answer: { type: Type.STRING, description: "Đáp án đúng của câu hỏi." },
                    explanation: { type: Type.STRING, description: "Giải thích chi tiết cho đáp án." },
                    sub_questions: {
                        type: Type.ARRAY,
                        description: "Các câu hỏi phụ cho loại 'true_false'.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                text: { type: Type.STRING },
                                answer: { type: Type.STRING, description: "'Đúng' hoặc 'Sai'." },
                                explanation: { type: Type.STRING }
                            },
                             required: ["id", "text", "answer"],
                        }
                    }
                },
                required: ["id", "text", "type", "answer"],
            }
        }
    },
    required: ["title", "metadata", "questions"],
};

export const generateExam = async (formData: ExamFormData): Promise<Exam> => {
    try {
        const prompt = generatePrompt(formData);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examSchema,
                temperature: 0.7,
            },
        });
        
        // Per guidelines, access the text property for the response.
        const jsonText = response.text.trim();
        const examData = JSON.parse(jsonText);
        
        return examData as Exam;

    } catch (error) {
        console.error("Error generating exam:", error);
        if (error instanceof Error) {
           throw new Error(`Failed to generate exam. Gemini API error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the exam.");
    }
};
