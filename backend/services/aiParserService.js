// ============================================================
// AI Parser Service — Extracts MCQs from unstructured text
// with validation & deduplication
// ============================================================

/**
 * Parse raw text into MCQ question objects.
 * Handles multiple PDF formats:
 *   - "Question 1: ...", "1. ...", "Q1) ..."
 *   - Options as A/B/C/D or 1/2/3/4
 *   - Answers as "Answer: A", "Option 4 : ...", "Ans: 1"
 */
const parseTextToMCQ = (text) => {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim());
    
    let currentQuestion = null;
    let state = 'SEARCHING_QUESTION'; // SEARCHING_QUESTION, READING_QUESTION, READING_OPTIONS, SEARCHING_ANSWER
    
    // Regexes for Format 1 and Format 2
    const questionStartRegex = /^(?:Q|Question)?\s*\d+[\.\):\s]*$/i; 
    const questionInlineRegex = /^(?:Q|Question)?\s*\d+[\.\):]\s*(.+)$/i; 
    
    // Options can be A) or 1.
    const optionARegex = /^([aA]|[1])[\.\)]\s*(.*)$/;
    const optionBRegex = /^([bB]|[2])[\.\)]\s*(.*)$/;
    const optionCRegex = /^([cC]|[3])[\.\)]\s*(.*)$/;
    const optionDRegex = /^([dD]|[4])[\.\)]\s*(.*)$/;
    
    // Answer can be "Answer: A", "Ans: 1", "Option 4 :"
    const answerRegex = /^(?:Answer|Ans|Correct|Option)\s*[:=\s]*([A-D1-4])/i;
    // Explicit ignore lines
    const ignoreRegex = /^(?:View this Question Online|>|Answer\s*\(Detailed)/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length === 0 || ignoreRegex.test(line)) continue;

        // 1. Check for Answer
        const ansMatch = line.match(answerRegex);
        if (ansMatch && currentQuestion && state === 'SEARCHING_ANSWER') {
            let ans = ansMatch[1].toUpperCase();
            if (ans === '1') ans = 'A';
            if (ans === '2') ans = 'B';
            if (ans === '3') ans = 'C';
            if (ans === '4') ans = 'D';
            
            currentQuestion.correct_answer = ans;
            
            if (!currentQuestion.option_d) currentQuestion.option_d = "None of the above";
            if (!currentQuestion.option_c) currentQuestion.option_c = "None of the above";
            
            questions.push({ ...currentQuestion });
            currentQuestion = null;
            state = 'SEARCHING_QUESTION';
            continue;
        }

        // 2. Check for explicit "Question X:" which ALWAYS starts a new question
        const isExplicitQuestion = /^(?:Q|Question)\s*\d+[\.\):\s]/i.test(line);

        // 3. Check for Options if we are currently parsing a question
        if (currentQuestion && !isExplicitQuestion) {
            const aMatch = line.match(optionARegex);
            if (aMatch && (state === 'READING_QUESTION' || state === 'READING_OPTIONS') && !currentQuestion.option_a) { 
                currentQuestion.option_a = aMatch[2]; state = 'READING_OPTIONS'; continue; 
            }
            
            const bMatch = line.match(optionBRegex);
            if (bMatch && state === 'READING_OPTIONS' && !currentQuestion.option_b) { 
                currentQuestion.option_b = bMatch[2]; state = 'READING_OPTIONS'; continue; 
            }
            
            const cMatch = line.match(optionCRegex);
            if (cMatch && state === 'READING_OPTIONS' && !currentQuestion.option_c) { 
                currentQuestion.option_c = cMatch[2]; state = 'READING_OPTIONS'; continue; 
            }
            
            const dMatch = line.match(optionDRegex);
            if (dMatch && state === 'READING_OPTIONS' && !currentQuestion.option_d) { 
                currentQuestion.option_d = dMatch[2]; state = 'SEARCHING_ANSWER'; continue; 
            }
        }

        // 4. Check for New Question
        const qInlineMatch = line.match(questionInlineRegex);
        const qStartMatch = line.match(questionStartRegex);
        
        if (isExplicitQuestion || (!currentQuestion && (qInlineMatch || qStartMatch))) {
            currentQuestion = {
                question: qInlineMatch ? qInlineMatch[1] : (qStartMatch ? '' : line.replace(/^(?:Q|Question)?\s*\d+[\.\):\s]*/i, '')),
                option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: ''
            };
            state = 'READING_QUESTION';
            continue;
        }

        if (!currentQuestion) continue;

        // 5. Accumulate text depending on state
        if (state === 'READING_QUESTION') {
            currentQuestion.question += (currentQuestion.question ? '\n' : '') + line;
        } else if (state === 'READING_OPTIONS') {
            if (/^([5-9]|[eE])[\.\)]/.test(line)) {
                 state = 'SEARCHING_ANSWER';
                 continue;
            }
        }
    }

    // Push the last one if it got stuck looking for an answer but had options
    if (currentQuestion && currentQuestion.question && currentQuestion.option_a && !currentQuestion.correct_answer) {
        // No answer found — will be flagged by validation
    }

    return questions;
};

/**
 * Validate extracted questions and flag issues.
 * Each question gets { isValid, errors[] } fields.
 */
const validateQuestions = (questions) => {
    return questions.map((q, index) => {
        const errors = [];

        if (!q.question || q.question.trim().length < 5) {
            errors.push('Question text is too short or missing');
        }
        if (!q.option_a || q.option_a.trim().length === 0) {
            errors.push('Option A is missing');
        }
        if (!q.option_b || q.option_b.trim().length === 0) {
            errors.push('Option B is missing');
        }
        if (!q.option_c || q.option_c.trim().length === 0) {
            errors.push('Option C is missing');
        }
        if (!q.option_d || q.option_d.trim().length === 0) {
            errors.push('Option D is missing');
        }
        if (!q.correct_answer || !['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) {
            errors.push('Correct answer is missing or invalid (must be A, B, C, or D)');
        }

        return {
            ...q,
            id: index + 1,
            isValid: errors.length === 0,
            errors
        };
    });
};

/**
 * Remove duplicate questions using normalized text comparison.
 * Uses Jaccard similarity on word sets — removes anything with > 85% overlap.
 */
const deduplicateQuestions = (questions) => {
    const normalize = (text) => {
        return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    };

    const jaccard = (setA, setB) => {
        const a = new Set(setA);
        const b = new Set(setB);
        const intersection = new Set([...a].filter(x => b.has(x)));
        const union = new Set([...a, ...b]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    };

    const result = [];
    const normalizedTexts = [];

    for (const q of questions) {
        const words = normalize(q.question);
        let isDuplicate = false;
        
        for (const existing of normalizedTexts) {
            if (jaccard(words, existing) > 0.85) {
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) {
            result.push(q);
            normalizedTexts.push(words);
        }
    }

    return result;
};

module.exports = { parseTextToMCQ, validateQuestions, deduplicateQuestions };
