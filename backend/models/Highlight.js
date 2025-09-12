const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const highlightSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  pdfUuid: {
    type: String,
    required: true,
    ref: 'PDF'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true,
    min: 1
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  boundingBox: {
    x: { type: Number, required: true },      
    y: { type: Number, required: true },      
    width: { type: Number, required: true },  
    height: { type: Number, required: true }, 
    pageWidth: Number,    
    pageHeight: Number
  },
  color: {
    type: String,
    default: '#ffff00', 
    validate: {
      validator: function(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
      },
      message: 'Color must be a valid hex color'
    }
  },
  note: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

highlightSchema.index({ pdfUuid: 1, userId: 1 });
highlightSchema.index({ userId: 1, createdAt: -1 });
highlightSchema.index({ pdfUuid: 1, pageNumber: 1 });

module.exports = mongoose.model('Highlight', highlightSchema);
