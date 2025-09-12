const express = require('express');
const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const {
      pdfUuid,
      pageNumber,
      text,
      boundingBox,
      color,
      note
    } = req.body;

    if (!pdfUuid || !pageNumber || !text || !boundingBox) {
      return res.status(400).json({
        success: false,
        message: 'pdfUuid, pageNumber, text, and boundingBox are required'
      });
    }

    const pdf = await PDF.findOne({
      uuid: pdfUuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found or access denied'
      });
    }

    const { x, y, width, height, pageWidth, pageHeight } = boundingBox;
    if (typeof x !== 'number' || typeof y !== 'number' || 
        typeof width !== 'number' || typeof height !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid bounding box coordinates'
      });
    }

    const highlight = new Highlight({
      pdfUuid,
      userId: req.user.userId,
      pageNumber,
      text: text.trim(),
      boundingBox: {
        x,
        y,
        width,
        height,
        pageWidth: pageWidth || null,
        pageHeight: pageHeight || null
      },
      color: color || '#ffff00', 
      note: note ? note.trim() : ''
    });

    await highlight.save();

    res.status(201).json({
      success: true,
      message: 'Highlight created successfully',
      highlight: {
        uuid: highlight.uuid,
        pdfUuid: highlight.pdfUuid,
        pageNumber: highlight.pageNumber,
        text: highlight.text,
        boundingBox: highlight.boundingBox,
        color: highlight.color,
        note: highlight.note,
        createdAt: highlight.createdAt
      }
    });

  } catch (error) {
    console.error('Create highlight error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating highlight',
      error: error.message
    });
  }
});

router.get('/pdf/:pdfUuid', auth, async (req, res) => {
  try {
    const { pdfUuid } = req.params;

    const pdf = await PDF.findOne({
      uuid: pdfUuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found or access denied'
      });
    }

    const highlights = await Highlight.find({
      pdfUuid,
      userId: req.user.userId
    }).sort({ pageNumber: 1, createdAt: 1 });

    const highlightsByPage = {};
    highlights.forEach(highlight => {
      if (!highlightsByPage[highlight.pageNumber]) {
        highlightsByPage[highlight.pageNumber] = [];
      }
      highlightsByPage[highlight.pageNumber].push({
        uuid: highlight.uuid,
        text: highlight.text,
        boundingBox: highlight.boundingBox,
        color: highlight.color,
        note: highlight.note,
        createdAt: highlight.createdAt,
        updatedAt: highlight.updatedAt
      });
    });

    res.json({
      success: true,
      pdfUuid,
      totalHighlights: highlights.length,
      highlightsByPage,
      highlights: highlights.map(h => ({
        uuid: h.uuid,
        pageNumber: h.pageNumber,
        text: h.text,
        boundingBox: h.boundingBox,
        color: h.color,
        note: h.note,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching highlights'
    });
  }
});

router.get('/:uuid', auth, async (req, res) => {
  try {
    const highlight = await Highlight.findOne({
      uuid: req.params.uuid,
      userId: req.user.userId
    });

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    res.json({
      success: true,
      highlight: {
        uuid: highlight.uuid,
        pdfUuid: highlight.pdfUuid,
        pageNumber: highlight.pageNumber,
        text: highlight.text,
        boundingBox: highlight.boundingBox,
        color: highlight.color,
        note: highlight.note,
        tags: highlight.tags,
        createdAt: highlight.createdAt,
        updatedAt: highlight.updatedAt
      }
    });

  } catch (error) {
    console.error('Get highlight error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching highlight details'
    });
  }
});

router.put('/:uuid', auth, async (req, res) => {
  try {
    const { color, note, boundingBox, tags } = req.body;

    const highlight = await Highlight.findOne({
      uuid: req.params.uuid,
      userId: req.user.userId
    });

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    if (color) {
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid color format. Use hex format like #ffff00'
        });
      }
      highlight.color = color;
    }

    if (note !== undefined) {
      highlight.note = note.trim();
    }

    if (boundingBox) {
      const { x, y, width, height, pageWidth, pageHeight } = boundingBox;
      if (typeof x === 'number' && typeof y === 'number' && 
          typeof width === 'number' && typeof height === 'number') {
        highlight.boundingBox = {
          x,
          y,
          width,
          height,
          pageWidth: pageWidth || highlight.boundingBox.pageWidth,
          pageHeight: pageHeight || highlight.boundingBox.pageHeight
        };
      }
    }

    if (tags && Array.isArray(tags)) {
      highlight.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    await highlight.save();

    res.json({
      success: true,
      message: 'Highlight updated successfully',
      highlight: {
        uuid: highlight.uuid,
        color: highlight.color,
        note: highlight.note,
        boundingBox: highlight.boundingBox,
        tags: highlight.tags,
        updatedAt: highlight.updatedAt
      }
    });

  } catch (error) {
    console.error('Update highlight error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating highlight'
    });
  }
});

router.delete('/:uuid', auth, async (req, res) => {
  try {
    const highlight = await Highlight.findOneAndDelete({
      uuid: req.params.uuid,
      userId: req.user.userId
    });

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    res.json({
      success: true,
      message: 'Highlight deleted successfully',
      deletedHighlight: {
        uuid: highlight.uuid,
        text: highlight.text,
        pdfUuid: highlight.pdfUuid
      }
    });

  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting highlight'
    });
  }
});

router.post('/batch', auth, async (req, res) => {
  try {
    const { pdfUuid, highlights } = req.body;

    if (!pdfUuid || !highlights || !Array.isArray(highlights)) {
      return res.status(400).json({
        success: false,
        message: 'pdfUuid and highlights array are required'
      });
    }

    const pdf = await PDF.findOne({
      uuid: pdfUuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found or access denied'
      });
    }

    const createdHighlights = [];
    const errors = [];

    for (let i = 0; i < highlights.length; i++) {
      try {
        const { pageNumber, text, boundingBox, color, note } = highlights[i];

        if (!pageNumber || !text || !boundingBox) {
          errors.push({
            index: i,
            error: 'Missing required fields: pageNumber, text, boundingBox'
          });
          continue;
        }

        const highlight = new Highlight({
          pdfUuid,
          userId: req.user.userId,
          pageNumber,
          text: text.trim(),
          boundingBox,
          color: color || '#ffff00',
          note: note ? note.trim() : ''
        });

        await highlight.save();
        createdHighlights.push(highlight);

      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdHighlights.length} highlights`,
      created: createdHighlights.length,
      errors: errors.length,
      errorDetails: errors,
      highlights: createdHighlights.map(h => ({
        uuid: h.uuid,
        pageNumber: h.pageNumber,
        text: h.text,
        color: h.color
      }))
    });

  } catch (error) {
    console.error('Batch create highlights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating highlights batch'
    });
  }
});

router.get('/search/:pdfUuid', auth, async (req, res) => {
  try {
    const { pdfUuid } = req.params;
    const { q, color, page } = req.query;

    const pdf = await PDF.findOne({
      uuid: pdfUuid,
      userId: req.user.userId
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found or access denied'
      });
    }

    let searchQuery = {
      pdfUuid,
      userId: req.user.userId
    };

    if (q) {
      searchQuery.$or = [
        { text: { $regex: q, $options: 'i' } },
        { note: { $regex: q, $options: 'i' } }
      ];
    }

    if (color) {
      searchQuery.color = color;
    }

    if (page) {
      searchQuery.pageNumber = parseInt(page);
    }

    const highlights = await Highlight.find(searchQuery)
      .sort({ pageNumber: 1, createdAt: 1 });

    res.json({
      success: true,
      query: { q, color, page },
      results: highlights.length,
      highlights: highlights.map(h => ({
        uuid: h.uuid,
        pageNumber: h.pageNumber,
        text: h.text,
        boundingBox: h.boundingBox,
        color: h.color,
        note: h.note,
        createdAt: h.createdAt
      }))
    });

  } catch (error) {
    console.error('Search highlights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching highlights'
    });
  }
});

module.exports = router;
