const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in backend environment variables.');
  }
  return new Groq({ apiKey });
};

// @route   POST /api/ai/chat
// @desc    Send a prompt to Groq AI tutor and return real-time reasoning response
// @access  Public / Protected
router.post('/chat', async (req, res) => {
  const { prompt, history = [], learningStyle = 'socratic', subject } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required.',
    });
  }

  try {
    const groq = getGroqClient();

    let systemInstruction = `You are Synexora AI, an intelligent, concise, and helpful academic tutor for university students. Keep your answers clear, educational, well-structured, and helpful.`;

    if (learningStyle === 'socratic') {
      systemInstruction += ` Guide the student step-by-step with intuitive explanations and first-principles reasoning.`;
    } else if (learningStyle === 'hands-on') {
      systemInstruction += ` Provide concrete examples, code, or practical applications.`;
    } else {
      systemInstruction += ` Provide concise bullet points, core formulas, and key summaries.`;
    }

    if (subject) {
      systemInstruction += ` Focus on the context of: ${subject}.`;
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.slice(-6).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || msg.content,
      })),
      { role: 'user', content: prompt },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'qwen/qwen3.6-27b',
      temperature: 0.6,
      max_tokens: 600,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || 'I could not generate an answer at this time.';

    // Strip internal thought reasoning tags if returned by reasoning models
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    return res.status(200).json({
      success: true,
      reply: rawReply,
      model: 'qwen/qwen3.6-27b',
    });
  } catch (err) {
    console.error('[Groq AI Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate response from Groq AI.',
      error: err.message,
    });
  }
});

// @route   POST /api/ai/memory-doubt
// @desc    Ask a doubt on a specific memory recall concept (Mini RAG)
router.post('/memory-doubt', async (req, res) => {
  const { concept, definition, course, question, history = [] } = req.body;

  if (!concept || !question || !question.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Concept and doubt question are required.',
    });
  }

  try {
    const groq = getGroqClient();

    const systemInstruction = `You are Synexora RAG Doubt Solver, an expert academic tutor.
The student is asking a doubt regarding the following specific study memory note:
=== GROUNDED STUDY CONTEXT ===
Topic / Concept: ${concept}
Course / Subject: ${course || 'General'}
Source Notes & Definition:
${definition}
==============================

Instructions:
1. Ground your answer in the provided study note context above.
2. Directly answer the student's doubt with clear explanation, intuitive analogies, or step-by-step breakdowns.
3. If they ask for examples, formula derivations, edge cases, or quiz questions, provide them clearly.
4. Keep the response well-structured, educational, and easy to understand.`;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.slice(-6).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || msg.content,
      })),
      { role: 'user', content: question.trim() },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'qwen/qwen3.6-27b',
      temperature: 0.5,
      max_tokens: 700,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || 'I could not generate an answer for this doubt.';
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    return res.status(200).json({
      success: true,
      reply: rawReply,
      model: 'qwen/qwen3.6-27b',
    });
  } catch (err) {
    console.error('[Memory Doubt Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to solve doubt with Groq AI.',
      error: err.message,
    });
  }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate interactive multiple-choice quiz questions on any user topic
router.post('/generate-quiz', async (req, res) => {
  const { topic, difficulty = 'medium', questionCount = 5, course = 'General' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required to generate an evaluation quiz.',
    });
  }

  const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 10);

  try {
    const groq = getGroqClient();

    const systemInstruction = `You are Synexora Evaluation & Assessment Engine.
Your task is to generate high-quality, academic-grade multiple choice questions (MCQs) for university students based on the topic provided.
Generate exactly ${count} questions of difficulty "${difficulty}".

You MUST return ONLY a strict valid JSON array of question objects with no markdown code fences, no extra text, and no thought tags.
Format of each question object in the JSON array:
{
  "q": "The question text clearly stated",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correct": 0,
  "explanation": "Clear educational explanation of why the answer is correct and why other options are incorrect",
  "keyConcept": "Core concept tested"
}`;

    const userPrompt = `TOPIC: "${topic.trim()}"
COURSE / FIELD: "${course}"
DIFFICULTY: "${difficulty}"
NUMBER OF QUESTIONS: ${count}

Generate the JSON array of ${count} questions now:`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      model: 'qwen/qwen3.6-27b',
      temperature: 0.4,
      max_tokens: 1800,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || '[]';
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    // Clean markdown code blocks if returned
    rawReply = rawReply.replace(/```json/gi, '').replace(/```/g, '').trim();

    let questions = [];
    try {
      questions = JSON.parse(rawReply);
    } catch (parseErr) {
      const match = rawReply.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        questions = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse quiz questions from AI model.');
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions could be generated.');
    }

    return res.status(200).json({
      success: true,
      topic: topic.trim(),
      difficulty,
      course,
      count: questions.length,
      questions,
    });
  } catch (err) {
    console.error('[Quiz Generation Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz with AI.',
      error: err.message,
    });
  }
});

module.exports = router;
