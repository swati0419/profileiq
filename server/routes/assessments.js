const express = require('express');
const Assessment = require('../models/Assessment');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const assessments = await Assessment.find()
      .select('roleType fileName ats_score keyword_match_score format_score createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/summary', async (_req, res) => {
  try {
    const stats = await Assessment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avg_ats: { $avg: '$ats_score' },
          avg_keyword: { $avg: '$keyword_match_score' },
          avg_format: { $avg: '$format_score' },
        },
      },
    ]);
    res.json(stats[0] || { total: 0, avg_ats: 0, avg_keyword: 0, avg_format: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
