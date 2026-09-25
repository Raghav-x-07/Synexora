const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Helper: Run Python video pipeline process safely
const runPythonVideoPipeline = (topic, difficulty) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(__dirname, '..', '..', 'ai-service', 'services', 'video_pipeline.py');
    const projectRoot = path.resolve(__dirname, '..', '..');

    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUNBUFFERED: '1',
    };

    console.log(`[ConceptVideo API] Spawning video pipeline for "${topic}" (${difficulty})...`);
    const pyProcess = spawn('python', [pythonScript, '--topic', topic, '--difficulty', difficulty || 'beginner'], {
      cwd: projectRoot,
      env,
    });

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString('utf-8');
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString('utf-8');
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[ConceptVideo API] Python process failed (code ${code}):`, stderrData);
        return reject(new Error(`Video pipeline execution failed: ${stderrData || `Exit code ${code}`}`));
      }

      try {
        // Extract JSON block from output
        const jsonMatch = stdoutData.match(/--- JSON OUTPUT ---\s*(\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          return resolve(parsed);
        }

        // Fallback search for any valid JSON object
        const firstBrace = stdoutData.indexOf('{');
        const lastBrace = stdoutData.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = stdoutData.substring(firstBrace, lastBrace + 1);
          const parsed = JSON.parse(candidate);
          return resolve(parsed);
        }

        return reject(new Error('Failed to parse structured JSON from video pipeline output.'));
      } catch (err) {
        console.error('[ConceptVideo API] Output parse error:', err.message, stdoutData);
        return reject(new Error(`Invalid JSON output: ${err.message}`));
      }
    });

    pyProcess.on('error', (err) => {
      console.error('[ConceptVideo API] Failed to start python process:', err);
      return reject(new Error(`Could not spawn Python process: ${err.message}`));
    });
  });
};

// @route   POST /api/concept-video/generate
// @desc    Generate structured educational video lesson and render MP4
// @access  Public / Protected
router.post('/generate', async (req, res) => {
  const { topic, difficulty = 'beginner' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required to generate concept video.',
    });
  }

  try {
    const result = await runPythonVideoPipeline(topic.trim(), difficulty);

    return res.status(200).json({
      success: true,
      topic: result.topic || topic,
      difficulty: result.difficulty || difficulty,
      videoUrl: result.videoUrl,
      explanation: result.explanation || result.lesson?.summary || 'Concept explanation generated successfully.',
      lesson: result.lesson,
      duration_seconds: result.duration_seconds || 40,
      scenes_count: result.scenes_count || 4,
      generation_time_seconds: result.generation_time_seconds || 0,
      source: result.source || 'synexora-pipeline',
    });
  } catch (err) {
    console.error('[ConceptVideo API Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate concept video.',
      fallbackAvailable: true,
    });
  }
});

// @route   GET /api/concept-video/health
// @desc    Check status of video generation pipeline
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    pipeline: 'Synexora AI Concept Video Generator',
    features: ['Scene Generator', 'Free TTS Narration', 'FFmpeg MP4 Assembly'],
  });
});

module.exports = router;
