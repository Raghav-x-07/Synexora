const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Document = require('../models/Document');

const router = express.Router();

router.use(protect);

// @route   GET /api/documents
// @desc    Get all documents for current user
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: documents.length, documents });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/documents
// @desc    Add document record
router.post('/', async (req, res) => {
  try {
    const { name, category, size } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Document name is required' });
    }

    const document = await Document.create({
      user: req.user._id,
      name: name.endsWith('.pdf') || name.endsWith('.docx') ? name : `${name}.pdf`,
      category: category || 'General',
      size: size || '500 KB',
      uploadDate: new Date().toISOString().split('T')[0],
    });

    return res.status(201).json({ success: true, document });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    return res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
