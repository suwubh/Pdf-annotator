const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const pdfSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    validate: {
      validator: function(mimeType) {
        return mimeType === 'application/pdf';
      },
      message: 'Only PDF files are allowed'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPages: {
    type: Number,
    default: 0
  },
  metadata: {
    title: String,
    author: String,
    subject: String,
    creator: String,
    producer: String,
    creationDate: Date,
    modificationDate: Date
  }
}, {
  timestamps: true
});

pdfSchema.index({ userId: 1, createdAt: -1 });
pdfSchema.index({ uuid: 1 });

module.exports = mongoose.model('PDF', pdfSchema);
