const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const PDF = require('../models/PDF');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }
    
    const newPDF = new PDF({
      uuid: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user.userId
    });

    await newPDF.save();

    res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully',
      pdf: {
        uuid: newPDF.uuid,
        originalName: newPDF.originalName,
        fileSize: newPDF.fileSize,
        uploadDate: newPDF.createdAt
      }
    });

  } catch (error) {
    
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading PDF',
      error: error.message
    });
  }
});

router.get('/my-pdfs', auth, async (req, res) => {
  try {
    const pdfs = await PDF.find({ userId: req.user.userId })
      .select('uuid originalName fileSize totalPages createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pdfs.length,
      pdfs
    });

  } catch (error) {
    console.error('Get PDFs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching PDFs'
    });
  }
});

router.get('/:uuid', auth, async (req, res) => {
  try {
    const pdf = await PDF.findOne({
      uuid: req.params.uuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    if (!fs.existsSync(pdf.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    res.json({
      success: true,
      pdf: {
        uuid: pdf.uuid,
        originalName: pdf.originalName,
        fileSize: pdf.fileSize,
        totalPages: pdf.totalPages,
        uploadDate: pdf.createdAt,
        metadata: pdf.metadata
      }
    });

  } catch (error) {
    console.error('Get PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching PDF details'
    });
  }
});

router.get('/view/:uuid', auth, async (req, res) => {
  try {
    const pdf = await PDF.findOne({
      uuid: req.params.uuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    
    if (!fs.existsSync(pdf.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.originalName}"`);
    
    
    const fileStream = fs.createReadStream(pdf.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('View PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving PDF file'
    });
  }
});

router.put('/:uuid', auth, async (req, res) => {
  try {
    const { originalName } = req.body;

    if (!originalName || originalName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'PDF name is required'
      });
    }

    const pdf = await PDF.findOneAndUpdate(
      { uuid: req.params.uuid, userId: req.user.userId },
      { originalName: originalName.trim() },
      { new: true }
    );

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    res.json({
      success: true,
      message: 'PDF renamed successfully',
      pdf: {
        uuid: pdf.uuid,
        originalName: pdf.originalName,
        updatedAt: pdf.updatedAt
      }
    });

  } catch (error) {
    console.error('Update PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating PDF'
    });
  }
});

router.delete('/:uuid', auth, async (req, res) => {
  try {
    const pdf = await PDF.findOne({
      uuid: req.params.uuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    
    if (fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    await PDF.findByIdAndDelete(pdf._id);

    const Highlight = require('../models/Highlight');
    await Highlight.deleteMany({ pdfUuid: req.params.uuid });

    res.json({
      success: true,
      message: 'PDF deleted successfully'
    });

  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting PDF'
    });
  }
});

module.exports = router;
