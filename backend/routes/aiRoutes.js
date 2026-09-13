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

// Helper: Call Groq with automated model fallback
const callGroqWithFallback = async (groq, params) => {
  const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];
  let lastError = null;
  for (const model of candidateModels) {
    try {
      const response = await groq.chat.completions.create({
        ...params,
        model,
      });
      return { response, model };
    } catch (err) {
      console.warn(`[Groq Model ${model} Fallback Triggered]:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('All Groq AI models failed to respond.');
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

    const { response: chatCompletion, model: usedModel } = await callGroqWithFallback(groq, {
      messages,
      temperature: 0.6,
      max_tokens: 800,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || 'I could not generate an answer at this time.';

    // Strip internal thought reasoning tags if returned by reasoning models
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    return res.status(200).json({
      success: true,
      reply: rawReply,
      model: usedModel,
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

    const { response: chatCompletion, model: usedModel } = await callGroqWithFallback(groq, {
      messages,
      temperature: 0.5,
      max_tokens: 800,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || 'I could not generate an answer for this doubt.';
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    return res.status(200).json({
      success: true,
      reply: rawReply,
      model: usedModel,
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
Your task is to generate high-quality, academic-grade multiple choice questions (MCQs) for university students based on the requested topic.
Generate exactly ${count} questions of difficulty "${difficulty}".

You MUST return a valid JSON object matching this exact schema:
{
  "questions": [
    {
      "q": "The question text clearly stated",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct": 0,
      "explanation": "Clear educational explanation of why the answer is correct and why other options are incorrect",
      "keyConcept": "Core concept tested"
    }
  ]
}

Ensure "correct" is the 0-indexed number of the correct choice (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D).`;

    const userPrompt = `TOPIC: "${topic.trim()}"
COURSE / FIELD: "${course}"
DIFFICULTY: "${difficulty}"
NUMBER OF QUESTIONS: ${count}

Generate the JSON object with the ${count} questions array now:`;

    const { response: chatCompletion, model: usedModel } = await callGroqWithFallback(groq, {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 2200,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || '{}';
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    // Clean markdown code blocks if returned
    rawReply = rawReply.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsedData = {};
    try {
      parsedData = JSON.parse(rawReply);
    } catch (parseErr) {
      const match = rawReply.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse quiz response from AI model.');
      }
    }

    let questionsRaw = [];
    if (Array.isArray(parsedData)) {
      questionsRaw = parsedData;
    } else if (Array.isArray(parsedData.questions)) {
      questionsRaw = parsedData.questions;
    } else if (Array.isArray(parsedData.quiz)) {
      questionsRaw = parsedData.quiz;
    } else if (Array.isArray(parsedData.data)) {
      questionsRaw = parsedData.data;
    } else {
      const firstArray = Object.values(parsedData).find((v) => Array.isArray(v));
      if (firstArray) questionsRaw = firstArray;
    }

    if (!questionsRaw || questionsRaw.length === 0) {
      throw new Error('No quiz questions were returned by the AI model.');
    }

    // Normalize question objects to guarantee strict UI safety
    const normalizedQuestions = questionsRaw.map((item, index) => {
      const q = item.q || item.question || item.title || `Question ${index + 1} on ${topic.trim()}`;
      let options = Array.isArray(item.options) ? item.options.map(String) : [];
      if (options.length < 2) {
        options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }

      let correct = 0;
      if (typeof item.correct === 'number') {
        correct = item.correct;
      } else if (typeof item.correctAnswer === 'number') {
        correct = item.correctAnswer;
      } else if (typeof item.answer === 'number') {
        correct = item.answer;
      } else if (typeof item.answer === 'string') {
        const foundIdx = options.findIndex((o) => o.toLowerCase().trim() === item.answer.toLowerCase().trim());
        if (foundIdx !== -1) correct = foundIdx;
      }

      // Bound check
      correct = Math.max(0, Math.min(correct, options.length - 1));

      return {
        q,
        options,
        correct,
        explanation: item.explanation || item.reason || `Option ${String.fromCharCode(65 + correct)} is the correct answer based on ${topic.trim()} principles.`,
        keyConcept: item.keyConcept || item.concept || item.topic || topic.trim(),
      };
    });

    return res.status(200).json({
      success: true,
      topic: topic.trim(),
      difficulty,
      course,
      count: normalizedQuestions.length,
      questions: normalizedQuestions,
      model: usedModel,
    });
  } catch (err) {
    console.error('[Quiz Generation Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz with AI: ' + (err.message || 'Unknown error'),
      error: err.message,
    });
  }
});

module.exports = router;
