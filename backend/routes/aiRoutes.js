const express = require('express');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in backend environment variables.');
  }
  return new Groq({ apiKey });
};

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

// Helper: Call Groq with automated model fallback
const callGroqWithFallback = async (groq, params) => {
  const candidateModels = [
    'qwen/qwen3.8-27b',
    'groq/compound',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'groq/compound-mini',
  ];
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

    let systemInstruction = `You are Synexora AI, an intelligent, crystal-clear academic tutor.
When a student asks any concept question, doubt, or problem, you MUST format your response in a neatly aligned, structured, and visually organized layout using these exact standard sections:

### 📖 Concept Definition
Provide a precise, crystal-clear 1-3 sentence formal definition and foundational summary of the concept.

### 💡 Step-by-Step Solution & Explanation
Break down the solution or mechanism into clear, logically ordered steps:
- **Step 1: [Core Principle]** - Intuitive explanation, formula, or initial state.
- **Step 2: [Mechanics & Process]** - Step-by-step logic, proof, operations, or code snippet.
- **Step 3: [Result & Validation]** - Final result, edge cases, or key outcome.

### 🎯 Key Takeaway & Example
Provide a concrete real-world example, practical application, or core memory takeaway.

Formatting Rules:
- Keep the presentation clean, aligned, and readable.
- Use bold **terms** for emphasis and inline \`code\` for formulas, variables, and syntax.
- Maintain a helpful, encouraging academic tone suitable for ${learningStyle} learning.`;

    if (subject) {
      systemInstruction += `\nSubject Domain: ${subject}.`;
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

You MUST format your response using these exact standard sections:

### 📖 Concept Definition
Direct, clear 1-2 sentence definition or resolution to the student's doubt grounded in the note context.

### 💡 Step-by-Step Solution & Explanation
- **Step 1:** Core intuition, rule, or formula grounded in the concept.
- **Step 2:** Step-by-step resolution of the student's specific doubt.
- **Step 3:** Detailed proof, mechanics, or nuance.

### 🎯 Key Takeaway & Example
Concrete takeaway, memory mnemonic, or quick practical example to remember this concept easily.`;

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

// @route   POST /api/ai/visualize
// @desc    Generate interactive academic concept Flowchart & Process Workflow for any topic
// @access  Public / Protected
router.post('/visualize', async (req, res) => {
  const { topic, context = '', style = 'flowchart' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required to generate a flowchart.',
    });
  }

  const cleanTopic = topic.trim();
  let flowchartTitle = `${cleanTopic} • Concept Process Flowchart`;
  let flowchartSummary = `Interactive step-by-step workflow and logic diagram for ${cleanTopic}.`;
  let category = 'general';
  let steps = [
    {
      step: 1,
      type: 'start',
      title: `Initiate ${cleanTopic}`,
      description: `Initial state and prerequisite conditions for ${cleanTopic}.`,
      details: 'Prerequisite parameters and input configuration.',
      badge: 'Start / Input',
    },
    {
      step: 2,
      type: 'process',
      title: 'Core Mechanism & Execution',
      description: 'Primary transformation, reaction, or algorithmic operation.',
      details: 'Active state processing.',
      badge: 'Core Process',
    },
    {
      step: 3,
      type: 'decision',
      title: 'Validation & Condition Check',
      description: 'Check whether boundary conditions or equilibrium states are satisfied.',
      details: 'Condition validation check.',
      badge: 'Decision Check',
    },
    {
      step: 4,
      type: 'end',
      title: 'Final Outcome & Output',
      description: 'Stable final state, synthesized output, or return value.',
      details: 'Result equilibrium attained.',
      badge: 'Outcome / End',
    },
  ];
  let connections = [
    { from: 1, to: 2, label: 'Proceed' },
    { from: 2, to: 3, label: 'Evaluate' },
    { from: 3, to: 4, label: 'Valid / Complete' },
  ];
  let keyTakeaways = [
    `Follows structured sequential transitions from input to output.`,
    `Guarantees deterministic execution and state equilibrium.`,
  ];

  try {
    const gemini = getGeminiClient();
    let parsed = null;

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const geminiPrompt = `You are Synexora Process & Flowchart AI Engine. Analyze this academic study topic: "${cleanTopic}".
Context: "${context.slice(0, 400)}"

Generate a comprehensive, scientifically/technically accurate STEP-BY-STEP PROCESS FLOWCHART for "${cleanTopic}".
The flowchart should clearly break down how this concept/algorithm/biological process/physical law functions from start to finish.

Return ONLY a valid JSON object matching this exact schema:
{
  "flowchartTitle": "Concise, descriptive title (e.g. 'DNA Double Helix Replication Mechanism Flowchart')",
  "flowchartSummary": "Clear 2-sentence educational summary explaining what this flowchart maps out and its goal.",
  "category": "biology | computing | physics | chemistry | mathematics | engineering | general",
  "steps": [
    {
      "step": 1,
      "type": "start",
      "title": "Clear title of start step",
      "description": "Accurate description of the starting condition/inputs",
      "details": "Key enzymes, formulas, variables, or prerequisites",
      "badge": "Initiation"
    },
    {
      "step": 2,
      "type": "process",
      "title": "Clear title of action step",
      "description": "Accurate description of what happens",
      "details": "Technical detail or mechanism",
      "badge": "Active Process"
    },
    {
      "step": 3,
      "type": "decision",
      "title": "Condition or Branch Question?",
      "description": "What condition is being tested/evaluated?",
      "details": "Yes ➔ continue to next step; No ➔ retry or alternate branch",
      "badge": "Condition Check"
    },
    {
      "step": 4,
      "type": "process",
      "title": "Secondary Transformation / Extension",
      "description": "Next phase in the sequence",
      "details": "Enzymatic or computational operation",
      "badge": "Synthesis"
    },
    {
      "step": 5,
      "type": "end",
      "title": "Final Synthesized Outcome / Termination",
      "description": "Final result, output product, or stabilized state",
      "details": "End product or final return value",
      "badge": "Final Output"
    }
  ],
  "connections": [
    { "from": 1, "to": 2, "label": "Start Process" },
    { "from": 2, "to": 3, "label": "Evaluate Condition" },
    { "from": 3, "to": 4, "label": "If True / Valid" },
    { "from": 4, "to": 5, "label": "Finalize" }
  ],
  "keyTakeaways": [
    "Core takeaway 1 about this process flow",
    "Core takeaway 2 about efficiency or biological/physical significance"
  ]
}

Include between 4 to 7 accurate sequential steps with at least 1 decision/validation branch if applicable.`;

        const geminiRes = await model.generateContent(geminiPrompt);
        const rawText = geminiRes.response.text();
        parsed = JSON.parse(rawText);
      } catch (geminiErr) {
        console.warn('[Gemini Flowchart AI Fallback to Groq]:', geminiErr.message);
      }
    }

    if (!parsed) {
      const groq = getGroqClient();

      const systemPrompt = `You are Synexora Flowchart Engine. Analyze the topic and generate a clear step-by-step flowchart in JSON.
Return ONLY valid JSON matching:
{
  "flowchartTitle": "Topic Flowchart Title",
  "flowchartSummary": "Summary of process",
  "category": "biology | computing | physics | chemistry | mathematics | engineering | general",
  "steps": [
    {
      "step": 1,
      "type": "start",
      "title": "Initial Step",
      "description": "Description",
      "details": "Technical detail",
      "badge": "Start"
    },
    {
      "step": 2,
      "type": "process",
      "title": "Core Action",
      "description": "Description",
      "details": "Technical detail",
      "badge": "Process"
    },
    {
      "step": 3,
      "type": "decision",
      "title": "Validation Condition?",
      "description": "Condition description",
      "details": "Yes/No check",
      "badge": "Check"
    },
    {
      "step": 4,
      "type": "end",
      "title": "Outcome",
      "description": "Description",
      "details": "Final state",
      "badge": "End"
    }
  ],
  "connections": [
    { "from": 1, "to": 2, "label": "Next" },
    { "from": 2, "to": 3, "label": "Check" },
    { "from": 3, "to": 4, "label": "Complete" }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"]
}`;

      const userContent = `Topic: "${cleanTopic}"
Context: "${context.slice(0, 400)}"`;

      const { response } = await callGroqWithFallback(groq, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      let raw = response.choices[0]?.message?.content || '{}';
      if (raw.includes('</think>')) raw = raw.split('</think>')[1].trim();
      raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(raw);
    }

    if (parsed.flowchartTitle?.trim()) flowchartTitle = parsed.flowchartTitle.trim();
    if (parsed.flowchartSummary?.trim()) flowchartSummary = parsed.flowchartSummary.trim();
    if (parsed.category?.trim()) category = parsed.category.trim().toLowerCase();
    if (Array.isArray(parsed.steps) && parsed.steps.length >= 2) {
      steps = parsed.steps.map((s, idx) => ({
        step: typeof s.step === 'number' ? s.step : idx + 1,
        type: (s.type || 'process').toLowerCase(),
        title: s.title || `Step ${idx + 1}`,
        description: s.description || `Operation at step ${idx + 1}`,
        details: s.details || '',
        badge: s.badge || (s.type === 'start' ? 'Initiation' : s.type === 'end' ? 'Outcome' : s.type === 'decision' ? 'Check' : 'Process'),
      }));
    }
    if (Array.isArray(parsed.connections) && parsed.connections.length > 0) {
      connections = parsed.connections.map((c) => ({
        from: typeof c.from === 'number' ? c.from : parseInt(c.from, 10) || 1,
        to: typeof c.to === 'number' ? c.to : parseInt(c.to, 10) || 2,
        label: c.label || 'Next',
      }));
    }
    if (Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0) {
      keyTakeaways = parsed.keyTakeaways.map(String);
    }
  } catch (err) {
    console.warn('[Flowchart Generation Fallback]:', err.message);
  }

  return res.status(200).json({
    success: true,
    topic: cleanTopic,
    flowchartTitle,
    flowchartSummary,
    category,
    steps,
    connections,
    keyTakeaways,
    provider: 'Synexora AI Flowchart Engine',
  });
});

// @route   GET /api/ai/synexora-image
// @desc    Stream Synexora AI generated 8K educational diagram
// @access  Public
router.get('/synexora-image', async (req, res) => {
  const { prompt, seed = '12345' } = req.query;
  if (!prompt) {
    return res.status(400).send('Prompt is required.');
  }

  try {
    const axios = require('axios');
    const encoded = encodeURIComponent(String(prompt).slice(0, 400));
    const targetUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&nofeed=true&model=flux`;

    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      timeout: 25000,
    });

    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('[Synexora Image Error]', err.message);
    return res.status(502).send('Failed to synthesize Synexora AI image.');
  }
});

module.exports = router;
