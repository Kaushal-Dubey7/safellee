const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('User', userSchema);
