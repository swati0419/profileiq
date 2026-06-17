const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');
const PDF2Json = require('pdf2json');
const Assessment = require('../models/Assessment');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = (role) => `You are an expert ATS evaluator and career coach specializing in ${role.replace(/_/g, ' ')} roles. Analyze the provided resume against the job description and return ONLY a valid JSON object with this exact structure, no markdown fences, no preamble:
{
  "ats_score": <integer 0-100>,
  "keyword_match_score": <integer 0-100>,
  "format_score": <integer 0-100>,
  "sections": [
    {"name": "Experience relevance", "score": <0-100>},
    {"name": "Skills alignment", "score": <0-100>},
    {"name": "Education match", "score": <0-100>},
    {"name": "Project quality", "score": <0-100>},
    {"name": "Quantifiable impact", "score": <0-100>}
  ],
  "keywords": {
    "found": [<strings — keywords found in resume>],
    "missing": [<strings — important keywords from JD not in resume>],
    "partial": [<strings — mentioned but weakly>]
  },
  "skill_gaps": [
    {"skill": "<skill name>", "resume_level": <0-100>, "required_level": <0-100>}
  ],
  "suggestions": [<6-8 specific actionable improvement sentences>]
}`;

router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, roleType, resumeText } = req.body;

    if (!jobDescription) return res.status(400).json({ error: 'Job description is required.' });

    let extractedText = resumeText || '';
    let fileName = null;

    if (req.file) {
      fileName = req.file.originalname;
      if (req.file.mimetype === 'application/pdf') {
        extractedText = await new Promise((resolve, reject) => {
          const pdfParser = new PDF2Json();
          pdfParser.on('pdfParser_dataError', reject);
          pdfParser.on('pdfParser_dataReady', (data) => {
            const text = data.Pages.map(page =>
              page.Texts.map(t => {
                try { return decodeURIComponent(t.R[0].T); }
                catch { return t.R[0].T; }
              }).join(' ')
            ).join('\n');
            resolve(text);
          });
          pdfParser.parseBuffer(req.file.buffer);
        });
      } else {
        extractedText = req.file.buffer.toString('utf-8');
      }
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No resume content found. Upload a file or paste text.' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT(roleType || 'software_engineer') },
        { role: 'user', content: `Resume:\n${extractedText}\n\nJob Description:\n${jobDescription}` }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const rawText = completion.choices[0].message.content
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(rawText);

    const assessment = await Assessment.create({
      resumeText: extractedText,
      jobDescription,
      roleType: roleType || 'software_engineer',
      fileName,
      ...parsed,
    });

    res.json({ id: assessment._id, ...parsed });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

module.exports = router;