
import type { Exam } from '../types';

function createDownloadLink(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const generateJsonFile = (examData: Exam) => {
  const jsonString = JSON.stringify(examData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  createDownloadLink(blob, 'exam-data.json');
};

export const generateDocxFile = (examData: Exam) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = window.docx;

  const docChildren = [];

  // Title and Metadata
  docChildren.push(new Paragraph({
    text: examData.title,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
  }));
  docChildren.push(new Paragraph({
    text: `Thời gian làm bài: ${examData.metadata.duration} | Số lượng câu hỏi: ${examData.metadata.numQuestions}`,
    alignment: AlignmentType.CENTER,
  }));
  docChildren.push(new Paragraph({
    text: examData.metadata.instructions,
    alignment: AlignmentType.CENTER,
    style: "italic",
  }));
  docChildren.push(new Paragraph("")); // Spacer

  // Questions
  examData.questions.forEach((q, index) => {
    docChildren.push(new Paragraph({
      children: [
        new TextRun({ text: `Câu ${index + 1}: `, bold: true }),
        new TextRun(q.text),
      ],
    }));

    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach(opt => {
        docChildren.push(new Paragraph({ text: opt, indentation: { left: 720 } }));
      });
    } else if (q.type === 'true_false' && q.sub_questions) {
      q.sub_questions.forEach(sub => {
        docChildren.push(new Paragraph({
          text: `${sub.id}) ${sub.text}`,
          indentation: { left: 720 },
        }));
      });
    } else if (q.type === 'fill_in_the_blank') {
       docChildren.push(new Paragraph({
          text: `Trả lời: ............................................................`,
          indentation: { left: 720 },
        }));
    } else if (q.type === 'essay') {
      docChildren.push(new Paragraph(""));
      docChildren.push(new Paragraph(""));
      docChildren.push(new Paragraph(""));
    }
    docChildren.push(new Paragraph("")); // Spacer after each question
  });

  // Answer Key Section
  docChildren.push(new Paragraph({ children: [new PageBreak()] }));
  docChildren.push(new Paragraph({
    text: "ĐÁP ÁN VÀ GIẢI THÍCH CHI TIẾT",
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }));
  docChildren.push(new Paragraph("")); // Spacer

  examData.questions.forEach((q, index) => {
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: `Câu ${index + 1}:`, bold: true })],
    }));

    if (q.type === 'multiple_choice' || q.type === 'fill_in_the_blank') {
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Đáp án: ", bold: true }),
          new TextRun(q.answer),
        ],
        indentation: { left: 400 },
      }));
    } else if (q.type === 'essay') {
       docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Gợi ý đáp án: ", bold: true }),
          new TextRun(q.answer),
        ],
        indentation: { left: 400 },
      }));
    } else if (q.type === 'true_false' && q.sub_questions) {
      q.sub_questions.forEach(sub => {
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: `${sub.id}) `, bold: true }),
            new TextRun(sub.answer),
          ],
          indentation: { left: 400 },
        }));
        if (sub.explanation) {
          docChildren.push(new Paragraph({
            children: [
              new TextRun({ text: "Giải thích: ", bold: true, italics: true }),
              new TextRun({ text: sub.explanation, italics: true }),
            ],
            indentation: { left: 800 },
          }));
        }
      });
    }

    if (q.explanation) {
       docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Giải thích: ", bold: true }),
          new TextRun(q.explanation),
        ],
        indentation: { left: 400 },
      }));
    }
    docChildren.push(new Paragraph("")); // Spacer
  });
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren,
    }],
  });

  Packer.toBlob(doc).then(blob => {
    createDownloadLink(blob, 'de-thi.docx');
  });
};


export const generateHtmlFile = (examData: Exam) => {
    const questionsHtml = examData.questions.map((q, index) => {
    let questionBodyHtml = '';
    // Main explanation for non-composite questions
    const explanationHtml = q.explanation ? `<div class="explanation" style="display: none;"><p><strong>Giải thích:</strong> ${q.explanation}</p></div>` : '';

    switch (q.type) {
      case 'multiple_choice':
        const optionsHtml = q.options?.map((option, optIndex) => `
          <div class="option">
            <input type="radio" id="q${q.id}-o${optIndex}" name="q_${q.id}" value="${option.split('.')[0]}">
            <label for="q${q.id}-o${optIndex}">${option}</label>
          </div>
        `).join('') || '';
        questionBodyHtml = `
          <div class="question" data-type="multiple_choice" data-answer="${q.answer}">
            <p><strong>Câu ${index + 1}:</strong> ${q.text}</p>
            <div class="options">${optionsHtml}</div>
            ${explanationHtml}
          </div>
        `;
        break;

      case 'true_false':
        const subQuestionsHtml = q.sub_questions?.map(sub => {
          const subExplanationHtml = sub.explanation ? `<div class="explanation" style="display: none;"><p><strong>Giải thích:</strong> ${sub.explanation}</p></div>` : '';
          return `
            <div class="sub-question" data-type="true_false" data-answer="${sub.answer}">
              <p>${sub.id}) ${sub.text}</p>
              <div class="options">
                <div class="option">
                  <input type="radio" id="q_${q.id}_${sub.id}_true" name="q_${q.id}_${sub.id}" value="Đúng">
                  <label for="q_${q.id}_${sub.id}_true">Đúng</label>
                </div>
                <div class="option">
                  <input type="radio" id="q_${q.id}_${sub.id}_false" name="q_${q.id}_${sub.id}" value="Sai">
                  <label for="q_${q.id}_${sub.id}_false">Sai</label>
                </div>
              </div>
              ${subExplanationHtml}
            </div>
          `;
        }).join('') || '';
        questionBodyHtml = `
          <div class="question" data-type="composite">
             <p><strong>Câu ${index + 1}:</strong> ${q.text}</p>
             <div class="sub-questions-container">${subQuestionsHtml}</div>
             ${explanationHtml}
          </div>
        `;
        break;

      case 'fill_in_the_blank':
         questionBodyHtml = `
            <div class="question" data-type="fill_in_the_blank" data-answer="${q.answer}">
                <p><strong>Câu ${index + 1}:</strong> ${q.text}</p>
                <input type="text" class="fill-in-blank-input" placeholder="Nhập câu trả lời...">
                ${explanationHtml}
            </div>
         `;
        break;
      
      case 'essay':
         questionBodyHtml = `
            <div class="question" data-type="essay">
                <p><strong>Câu ${index + 1}:</strong> ${q.text}</p>
                <textarea rows="5" placeholder="Nhập câu trả lời..."></textarea>
                <div class="explanation" style="display: none;"><p><strong>Gợi ý đáp án:</strong> ${q.answer}</p>${q.explanation ? `<p><strong>Giải thích thêm:</strong> ${q.explanation}</p>` : ''}</div>
            </div>
         `;
        break;
    }
    return questionBodyHtml;
  }).join('');

  const scriptJS = `
    document.getElementById('submit-btn').addEventListener('click', () => {
      const questions = document.querySelectorAll('.question, .sub-question');
      let score = 0;
      let totalScorable = 0;

      questions.forEach(q => {
        const type = q.dataset.type;
        if (type === 'composite' || type === 'essay') return;

        totalScorable++;
        const correctAnswer = q.dataset.answer;
        let isCorrect = false;

        q.classList.remove('correct', 'incorrect');
        
        if (type === 'multiple_choice' || type === 'true_false') {
            const selectedOption = q.querySelector('input[type="radio"]:checked');
            if (selectedOption && selectedOption.value === correctAnswer) {
                isCorrect = true;
            }
        } else if (type === 'fill_in_the_blank') {
            const input = q.querySelector('input.fill-in-blank-input');
            if (input && input.value.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            score++;
            q.classList.add('correct');
        } else {
            q.classList.add('incorrect');
            const answerEl = document.createElement('p');
            answerEl.className = 'correct-answer';
            answerEl.innerHTML = '<strong>Đáp án đúng:</strong> ' + correctAnswer;
            const optionsDiv = q.querySelector('.options') || q.querySelector('p');
            if (optionsDiv) {
                optionsDiv.insertAdjacentElement('afterend', answerEl);
            }
        }
        
        const explanationEl = q.querySelector('.explanation');
        if (explanationEl) {
            explanationEl.style.display = 'block';
        }
      });
      
      document.querySelectorAll('.question[data-type="essay"]').forEach(q => {
          const explanationEl = q.querySelector('.explanation');
          if (explanationEl) explanationEl.style.display = 'block';
      });
      
      const resultsEl = document.getElementById('results');
      if (resultsEl) {
         resultsEl.innerText = 'Kết quả: ' + score + ' / ' + totalScorable + ' câu hỏi có thể chấm điểm.';
      }
      const submitBtn = document.getElementById('submit-btn');
      if(submitBtn) {
        submitBtn.style.display = 'none';
      }
    });
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${examData.title}</title>
      <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            packages: {'[+]': ['mhchem']}
          },
          svg: {
            fontCache: 'global'
          }
        };
      </script>
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" id="MathJax-script" async></script>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0 auto; max-width: 800px; padding: 2rem; background-color: #f9fafb; color: #111827; }
        .exam-header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
        .exam-header h1 { font-size: 1.8rem; font-weight: bold; margin: 0; }
        .exam-header p { color: #4b5563; }
        .question { margin-bottom: 1.5rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fff; }
        .question > p:first-child { margin-top: 0; }
        .sub-questions-container { margin-top: 1rem; padding-left: 1rem; }
        .sub-question { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #e5e7eb; }
        .options { margin-top: 1rem; }
        .option { margin-bottom: 0.5rem; display: flex; align-items: center; }
        label { margin-left: 0.5rem; }
        .fill-in-blank-input, textarea { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; margin-top: 0.5rem; box-sizing: border-box; }
        textarea { resize: vertical; }
        #submit-btn { background-color: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; display: block; margin: 2rem auto; }
        #submit-btn:hover { background-color: #2563eb; }
        #results { text-align: center; font-size: 1.2rem; font-weight: bold; margin-top: 2rem; }
        .correct { border-left: 5px solid #10b981; }
        .incorrect { border-left: 5px solid #ef4444; }
        .correct-answer { color: #166534; font-weight: bold; background-color: #d1fae5; padding: 0.5rem; border-radius: 4px; margin-top: 1rem; }
        .explanation { margin-top: 1rem; padding: 0.75rem; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; color: #1e40af; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="exam-header">
        <h1>${examData.title}</h1>
        <p>Thời gian: ${examData.metadata.duration} | Số câu: ${examData.metadata.numQuestions}</p>
        <p><i>${examData.metadata.instructions}</i></p>
      </div>
      <div id="exam-body">
        ${questionsHtml}
      </div>
      <button id="submit-btn">Nộp bài</button>
      <div id="results"></div>

      <script>
        ${scriptJS}
      </script>
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html' });
  createDownloadLink(blob, 'interactive-exam.html');
};
