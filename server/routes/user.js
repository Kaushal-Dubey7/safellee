const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phone, address, profilePhoto } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    Object.assign(user, updates);

    if (user.fullName && user.phone && user.address && user.profilePhoto) {
      user.isProfileComplete = true;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePhoto: user.profilePhoto,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/user/photo
router.post('/photo', auth, async (req, res) => {
  try {
    const { photo } = req.body;
    if (!photo) {
      return res.status(400).json({ error: 'Photo data is required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePhoto: photo },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ profilePhoto: user.profilePhoto });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo.' });
  }
});

// GET /api/user/profile-status
router.get('/profile-status', auth, async (req, res) => {
  try {
    res.json({ isComplete: req.user.isProfileComplete });
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({ error: 'Failed to check profile status.' });
  }
});

module.exports = router;
