const express = require('express');
const router = express.Router();
const LovedOne = require('../models/LovedOne');
const auth = require('../middleware/auth');
const { validateLovedOne } = require('../middleware/validate');

// GET /api/lovedones
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await LovedOne.find({ userId: req.userId }).sort({ _id: 1 });
    res.json({ contacts });
  } catch (error) {
    console.error('Get loved ones error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// POST /api/lovedones
router.post('/', auth, validateLovedOne, async (req, res) => {
  try {
    const count = await LovedOne.countDocuments({ userId: req.userId });
    if (count >= 5) {
      return res.status(400).json({ error: 'Maximum 5 emergency contacts allowed.' });
    }

    const { name, phone, relationship } = req.body;
    const contact = new LovedOne({
      userId: req.userId,
      name,
      phone: phone.replace(/[\s-]/g, ''),
      relationship: relationship || ''
    });

    await contact.save();
    res.status(201).json({ contact });
  } catch (error) {
    console.error('Add loved one error:', error);
    res.status(500).json({ error: 'Failed to add contact.' });
  }
});

// PUT /api/lovedones/:id
router.put('/:id', auth, validateLovedOne, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    const contact = await LovedOne.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, phone: phone.replace(/[\s-]/g, ''), relationship: relationship || '' },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Update loved one error:', error);
    res.status(500).json({ error: 'Failed to update contact.' });
  }
});

// DELETE /api/lovedones/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await LovedOne.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    res.json({ message: 'Contact removed successfully.' });
  } catch (error) {
    console.error('Delete loved one error:', error);
    res.status(500).json({ error: 'Failed to delete contact.' });
  }
});

module.exports = router;
