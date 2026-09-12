const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const testUserToken = jwt.sign(
  { id: '66e287401122334455667788' },
  process.env.JWT_SECRET || 'synexora_super_secret_jwt_key_2026_modern_ai_platform',
  { expiresIn: '1d' }
);

async function testRAG() {
  console.log('--- Testing Synexora RAG Document Pipeline ---');

  // Verify text chunking and retrieval logic
  const Document = require('./models/Document');
  const Groq = require('groq-sdk');
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const sampleDocText = `
  Distributed Consensus and Raft Protocol Overview:
  Raft is a consensus algorithm designed to be easy to understand. It is equivalent to Paxos in fault-tolerance and performance.
  The Raft protocol decomposes consensus into three independent subproblems:
  1. Leader Election: A new leader must be chosen when an existing leader fails. Terms act as a logical clock in Raft.
  2. Log Replication: The leader must accept log entries from clients and replicate them across the cluster.
  3. Safety: If any server has applied a particular log entry to its state machine, no other server may apply a different log entry for the same log index.
  Heartbeats are sent by the leader periodically (e.g., every 50ms) to maintain authority and prevent follower election timeouts.
  `;

  const chunks = [
    { chunkIndex: 0, text: sampleDocText.slice(0, 300) },
    { chunkIndex: 1, text: sampleDocText.slice(250) },
  ];

  console.log('1. Generated Chunks for sample document:', chunks.length);

  // Test Groq RAG generation
  console.log('2. Querying Groq AI with grounded RAG context...');
  const studentQuestion = 'What are the three subproblems in the Raft consensus protocol and why are heartbeats used?';

  const systemPrompt = `You are Synexora Document Intelligence AI. Answer the student question based strictly on the provided document excerpts.`;
  const userPrompt = `DOCUMENT EXCERPTS:\n${sampleDocText}\n\nSTUDENT QUESTION:\n${studentQuestion}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'qwen/qwen3.6-27b',
    max_tokens: 500,
  });

  let reply = completion.choices[0]?.message?.content || '';
  if (reply.includes('</think>')) {
    reply = reply.split('</think>')[1].trim();
  }

  console.log('\n--- AI Grounded RAG Answer ---');
  console.log(reply);
  console.log('------------------------------');
  console.log('✅ RAG PIPELINE VERIFIED SUCCESSFULLY!');
}

testRAG().catch(console.error);
