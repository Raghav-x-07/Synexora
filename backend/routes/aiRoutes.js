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

module.exports = router;
