const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema({
  skill: String,
  resume_level: Number,
  required_level: Number,
});

const sectionSchema = new mongoose.Schema({
  name: String,
  score: Number,
});

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    roleType: { type: String, required: true },
    fileName: { type: String, default: null },

    ats_score: { type: Number, required: true },
    keyword_match_score: { type: Number, required: true },
    format_score: { type: Number, required: true },

    sections: [sectionSchema],

    keywords: {
      found: [String],
      missing: [String],
      partial: [String],
    },

    skill_gaps: [skillGapSchema],
    suggestions: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema); 
