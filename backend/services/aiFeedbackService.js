// ============================================================
// AI Feedback Service — Generate detailed performance insights
// Uses Gemini API if available, otherwise falls back to a
// rich rules-based template engine.
// ============================================================

/**
 * Generate AI feedback for an exam attempt.
 * @param {Object} params
 * @param {Object} params.result - The result row (score, total_marks, percentage, grade, status)
 * @param {Array} params.answers - Array of { question, selected_answer, correct_answer, difficulty }
 * @param {Object} params.exam - The exam info (exam_name, duration)
 * @param {Array} params.proctoringLogs - Array of proctoring violation logs
 * @returns {string} HTML/Markdown feedback string
 */
const generateFeedback = async ({ result, answers, exam, proctoringLogs = [] }) => {
    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
        try {
            return await generateWithGemini({ result, answers, exam, proctoringLogs }, apiKey);
        } catch (err) {
            console.error('Gemini API failed, falling back to template engine:', err.message);
            return generateWithTemplate({ result, answers, exam, proctoringLogs });
        }
    }

    return generateWithTemplate({ result, answers, exam, proctoringLogs });
};

/**
 * Generate feedback using Google Gemini API
 */
const generateWithGemini = async ({ result, answers, exam, proctoringLogs }, apiKey) => {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;

    const totalQuestions = answers.length;
    const correctCount = answers.filter(a => a.selected_answer === a.correct_answer).length;
    const incorrectCount = answers.filter(a => a.selected_answer && a.selected_answer !== a.correct_answer).length;
    const unanswered = answers.filter(a => !a.selected_answer).length;

    const difficultyBreakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    answers.forEach(a => {
        const d = a.difficulty || 'medium';
        difficultyBreakdown[d].total++;
        if (a.selected_answer === a.correct_answer) difficultyBreakdown[d].correct++;
    });

    const prompt = `You are an expert educational AI tutor. A student just completed an exam. Analyze their performance and provide detailed, personalized feedback.

Exam: ${exam.exam_name}
Score: ${result.score}/${result.total_marks} (${result.percentage}%)
Grade: ${result.grade} | Status: ${result.status}
Total Questions: ${totalQuestions} | Correct: ${correctCount} | Incorrect: ${incorrectCount} | Unanswered: ${unanswered}

Difficulty Breakdown:
- Easy: ${difficultyBreakdown.easy.correct}/${difficultyBreakdown.easy.total} correct
- Medium: ${difficultyBreakdown.medium.correct}/${difficultyBreakdown.medium.total} correct
- Hard: ${difficultyBreakdown.hard.correct}/${difficultyBreakdown.hard.total} correct

${proctoringLogs.length > 0 ? `Proctoring Violations: ${proctoringLogs.length} (${proctoringLogs.map(l => l.violation_type).join(', ')})` : 'No proctoring violations.'}

Questions the student got wrong:
${answers.filter(a => a.selected_answer && a.selected_answer !== a.correct_answer).map((a, i) => `${i + 1}. "${a.question}" — Chose: ${a.selected_answer}, Correct: ${a.correct_answer}`).join('\n')}

Please provide:
1. **Overall Assessment** — A brief encouraging summary of their performance.
2. **Strengths** — What they did well.
3. **Areas for Improvement** — Specific topics or question types they struggled with.
4. **Difficulty Analysis** — How they performed across easy, medium, and hard questions.
5. **Study Recommendations** — Concrete, actionable study tips.
6. **Motivational Closing** — An encouraging note.

Format your response as clean HTML with styled sections. Use emojis sparingly for visual appeal.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
};

/**
 * Generate feedback using a rich rules-based template engine (no API needed)
 */
const generateWithTemplate = ({ result, answers, exam, proctoringLogs }) => {
    const totalQuestions = answers.length;
    const correctCount = answers.filter(a => a.selected_answer === a.correct_answer).length;
    const incorrectCount = answers.filter(a => a.selected_answer && a.selected_answer !== a.correct_answer).length;
    const unanswered = answers.filter(a => !a.selected_answer).length;
    const pct = parseFloat(result.percentage);

    // Difficulty analysis
    const diff = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    answers.forEach(a => {
        const d = a.difficulty || 'medium';
        diff[d].total++;
        if (a.selected_answer === a.correct_answer) diff[d].correct++;
    });

    // Overall assessment
    let overallEmoji, overallTitle, overallDesc;
    if (pct >= 90) {
        overallEmoji = '🏆'; overallTitle = 'Outstanding Performance!';
        overallDesc = 'You have demonstrated an exceptional understanding of the material. Your preparation and knowledge are clearly evident in your results.';
    } else if (pct >= 75) {
        overallEmoji = '🌟'; overallTitle = 'Great Job!';
        overallDesc = 'You have shown a strong grasp of the core concepts. With a bit more focus on a few areas, you can aim for perfection.';
    } else if (pct >= 60) {
        overallEmoji = '👍'; overallTitle = 'Good Effort!';
        overallDesc = 'You have a decent understanding of the fundamentals. There are clear areas where targeted study will significantly boost your scores.';
    } else if (pct >= 40) {
        overallEmoji = '📚'; overallTitle = 'Needs Improvement';
        overallDesc = 'Your results indicate gaps in several key areas. Don\'t be discouraged — with a structured study plan, you can make great progress.';
    } else {
        overallEmoji = '💪'; overallTitle = 'Keep Pushing Forward';
        overallDesc = 'This is a challenging journey, and every attempt is a learning opportunity. Focus on building your foundational knowledge step by step.';
    }

    // Strengths
    const strengths = [];
    if (correctCount > 0) strengths.push(`You correctly answered <strong>${correctCount} out of ${totalQuestions}</strong> questions.`);
    if (diff.easy.total > 0 && diff.easy.correct === diff.easy.total) strengths.push('You answered <strong>all easy-level questions</strong> correctly — your fundamentals are solid.');
    if (diff.hard.total > 0 && diff.hard.correct > 0) strengths.push(`You solved <strong>${diff.hard.correct} hard-level question(s)</strong> — showing advanced problem-solving ability.`);
    if (diff.medium.total > 0 && diff.medium.correct >= Math.ceil(diff.medium.total * 0.7)) strengths.push('Strong performance on medium-difficulty questions — you handle moderate complexity well.');
    if (unanswered === 0) strengths.push('You attempted <strong>every question</strong> — great time management and confidence!');
    if (strengths.length === 0) strengths.push('You showed up and took the exam — that takes courage. Every attempt is a learning opportunity.');

    // Weaknesses
    const weaknesses = [];
    if (diff.easy.total > 0 && diff.easy.correct < diff.easy.total) weaknesses.push(`You missed <strong>${diff.easy.total - diff.easy.correct} easy question(s)</strong>. Review the basics to ensure no marks are lost on simpler topics.`);
    if (diff.medium.total > 0 && diff.medium.correct < Math.ceil(diff.medium.total * 0.5)) weaknesses.push(`Performance on medium-difficulty questions was below average (<strong>${diff.medium.correct}/${diff.medium.total}</strong>). This is where the biggest gains can be made.`);
    if (diff.hard.total > 0 && diff.hard.correct === 0) weaknesses.push('No hard-level questions were answered correctly. Consider building up to these gradually after mastering medium topics.');
    if (unanswered > 0) weaknesses.push(`<strong>${unanswered} question(s)</strong> were left unanswered. Even an educated guess is better than leaving a question blank.`);
    if (incorrectCount > totalQuestions * 0.5) weaknesses.push('More than half of your attempted answers were incorrect. Focus on understanding concepts rather than memorizing answers.');

    // Difficulty analysis text
    const diffAnalysis = ['easy', 'medium', 'hard'].map(level => {
        const d = diff[level];
        if (d.total === 0) return null;
        const rate = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
        const label = level.charAt(0).toUpperCase() + level.slice(1);
        const color = level === 'easy' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444';
        const bar = `<div style="background:#e5e7eb;border-radius:99px;height:10px;margin-top:4px"><div style="background:${color};width:${rate}%;border-radius:99px;height:10px;min-width:4px"></div></div>`;
        return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:0.9rem"><strong>${label}</strong><span>${d.correct}/${d.total} (${rate}%)</span></div>${bar}</div>`;
    }).filter(Boolean).join('');

    // Study recommendations
    const recs = [];
    if (pct < 60) recs.push('📖 <strong>Start with the basics</strong> — re-read your textbook chapters and class notes before attempting practice questions.');
    if (diff.easy.correct < diff.easy.total) recs.push('🎯 <strong>Master the fundamentals</strong> — focus on easy-level practice questions until you consistently get 100%.');
    if (diff.medium.total > 0 && diff.medium.correct < diff.medium.total) recs.push('📝 <strong>Practice medium-level problems</strong> — these form the bulk of most exams and offer the best score improvement.');
    if (diff.hard.total > 0 && diff.hard.correct < diff.hard.total) recs.push('🧠 <strong>Challenge yourself</strong> — attempt hard problems after mastering medium ones, and review solutions carefully.');
    if (unanswered > 0) recs.push('⏱️ <strong>Improve time management</strong> — practice with timed mock tests to ensure you can answer all questions.');
    recs.push('🔄 <strong>Review mistakes</strong> — go through each incorrect answer above and understand why the correct answer is right.');
    if (pct >= 80) recs.push('🚀 <strong>Push for excellence</strong> — try teaching the material to someone else; it\'s the best way to solidify your understanding.');

    // Proctoring note
    let procNote = '';
    if (proctoringLogs.length > 0) {
        const types = {};
        proctoringLogs.forEach(l => { types[l.violation_type] = (types[l.violation_type] || 0) + 1; });
        const typeList = Object.entries(types).map(([t, c]) => `<li>${t.replace(/_/g, ' ')} — <strong>${c} occurrence(s)</strong></li>`).join('');
        procNote = `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-top:16px">
            <strong>⚠️ Proctoring Summary</strong>
            <p style="margin:8px 0 4px;font-size:0.9rem">During this exam, the following violations were recorded:</p>
            <ul style="margin:0;padding-left:20px;font-size:0.9rem">${typeList}</ul>
            <p style="margin:8px 0 0;font-size:0.85rem;color:#6b7280">Repeated violations may impact your exam validity. Please ensure a distraction-free environment for future exams.</p>
        </div>`;
    }

    // Compose HTML
    return `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6">
    <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem">${overallEmoji}</div>
        <h3 style="margin:8px 0 4px;font-size:1.25rem">${overallTitle}</h3>
        <p style="color:#6b7280;font-size:0.95rem;margin:0">${overallDesc}</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;text-align:center">
        <div style="background:#f0fdf4;border-radius:8px;padding:12px"><div style="font-size:1.5rem;font-weight:800;color:#10b981">${correctCount}</div><div style="font-size:0.8rem;color:#6b7280">Correct</div></div>
        <div style="background:#fef2f2;border-radius:8px;padding:12px"><div style="font-size:1.5rem;font-weight:800;color:#ef4444">${incorrectCount}</div><div style="font-size:0.8rem;color:#6b7280">Incorrect</div></div>
        <div style="background:#fffbeb;border-radius:8px;padding:12px"><div style="font-size:1.5rem;font-weight:800;color:#f59e0b">${unanswered}</div><div style="font-size:0.8rem;color:#6b7280">Unanswered</div></div>
        <div style="background:#eff6ff;border-radius:8px;padding:12px"><div style="font-size:1.5rem;font-weight:800;color:#3b82f6">${result.percentage}%</div><div style="font-size:0.8rem;color:#6b7280">Score</div></div>
    </div>

    <div style="margin-bottom:20px">
        <h4 style="margin:0 0 10px;font-size:1rem">✅ Strengths</h4>
        <ul style="margin:0;padding-left:20px;font-size:0.9rem">${strengths.map(s => `<li style="margin-bottom:6px">${s}</li>`).join('')}</ul>
    </div>

    ${weaknesses.length > 0 ? `<div style="margin-bottom:20px">
        <h4 style="margin:0 0 10px;font-size:1rem">🔍 Areas for Improvement</h4>
        <ul style="margin:0;padding-left:20px;font-size:0.9rem">${weaknesses.map(w => `<li style="margin-bottom:6px">${w}</li>`).join('')}</ul>
    </div>` : ''}

    <div style="margin-bottom:20px">
        <h4 style="margin:0 0 10px;font-size:1rem">📊 Difficulty Analysis</h4>
        ${diffAnalysis}
    </div>

    <div style="margin-bottom:20px">
        <h4 style="margin:0 0 10px;font-size:1rem">📋 Study Recommendations</h4>
        <ul style="margin:0;padding-left:20px;font-size:0.9rem">${recs.map(r => `<li style="margin-bottom:6px">${r}</li>`).join('')}</ul>
    </div>

    ${procNote}

    <div style="text-align:center;margin-top:20px;padding:16px;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-radius:8px">
        <p style="margin:0;font-size:0.95rem;color:#374151"><strong>💡 Remember:</strong> Every exam is a stepping stone. Review your mistakes, study consistently, and you will see improvement!</p>
    </div>
</div>`;
};

module.exports = { generateFeedback };
