const express = require('express');
const Assessment = require('../models/Assessment');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.userId })
      .select('roleType fileName ats_score keyword_match_score format_score createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Assessment.aggregate([
      { $match: { userId: req.userId } },
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
    const assessment = await Assessment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Assessment.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;