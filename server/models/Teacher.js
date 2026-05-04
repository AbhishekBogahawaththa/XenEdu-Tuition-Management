const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    qualifications: {
      type: String,
      trim: true,
    },
    subjectExpertise: [
      {
        type: String,
        enum: [
          'Combined Mathematics',
          'Physics',
          'Chemistry',
          'Information Technology',
          'Biology',
          'Agriculture',
          'Bio Systems Technology',
          'Economics',
          'Accounting',
          'Business Studies',
          'ICT',
          'Sinhala',
          'Tamil',
          'English',
          'Pali',
          'Sanskrit',
          'Arabic',
          'French',
          'German',
          'Japanese',
          'Chinese',
          'Hindi',
          'History',
          'Geography',
          'Political Science',
          'Logic & Scientific Method',
          'Economics (Arts)',
          'Sinhala Literature',
          'Tamil Literature',
          'English Literature',
          'Buddhist Civilization',
          'Hindu Civilization',
          'Islamic Civilization',
          'Christian Civilization',
          'Greek & Roman Civilization',
          'Art',
          'Dancing (Indigenous)',
          'Dancing (Bharatha)',
          'Dancing (Western)',
          'Drama & Theatre (Sinhala)',
          'Drama & Theatre (Tamil)',
          'Drama & Theatre (English)',
          'Music (Oriental)',
          'Music (Carnatic)',
          'Music (Western)',
          'Engineering Technology',
          'Bio Technology',
          'Food Technology',
          'Agriculture Technology',
        ],
      },
    ],
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);