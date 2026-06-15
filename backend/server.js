require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const groq = new Groq({
apiKey: process.env.GROQ_API_KEY
});

app.get('/', (req, res) => {
res.send('🟢 Quiz Master backend chal raha hai!');
});

app.post('/generate-quiz', async (req, res) => {
const { topic, difficulty, numQuestions } = req.body;

if (!topic || !topic.trim()) {
return res.status(400).json({
error: '✏️ Topic toh batao pehle!'
});
}

const count = Number(numQuestions) || 5;
const level = difficulty || 'medium';

const prompt = `Generate exactly ${count} multiple choice quiz questions about "${topic}" at ${level} difficulty.

Return ONLY valid JSON in this exact format:

{
"questions": [
{
"question": "string",
"options": ["option A", "option B", "option C", "option D"],
"correctIndex": 0,
"explanation": "short explanation"
}
]
}`;

try {
const completion = await groq.chat.completions.create({
model: "llama-3.3-70b-versatile",
temperature: 0.8,
messages: [
{
role: "user",
content: prompt
}
]
});

let text = completion.choices[0].message.content.trim();

text = text.replace(/```json|```/g, '').trim();

const quiz = JSON.parse(text);

if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
  throw new Error('AI ne sahi format mein quiz nahi diya');
}

res.json(quiz);

} catch (err) {
console.error('Server error:', err);

res.status(500).json({
  error: '🔧 Quiz generate karte waqt error aaya: ' + err.message
});

}
});

app.listen(PORT, () => {
console.log("🚀 Quiz Master server chal raha hai → http://localhost:${PORT}");
});