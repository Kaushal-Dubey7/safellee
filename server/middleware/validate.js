const validateRegister = (req, res, next) => {
  const { fullName, email, password, phone } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) {
    errors.push('Please provide a valid phone number.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validateLovedOne = (req, res, next) => {
  const { name, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length < 1) {
    errors.push('Contact name is required.');
  }
  if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) {
    errors.push('Please provide a valid phone number with country code.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validateJourney = (req, res, next) => {
  const { source, destination } = req.body;
  const errors = [];

  if (!source || !source.coordinates || typeof source.coordinates.lat !== 'number' || typeof source.coordinates.lng !== 'number') {
    errors.push('Valid source coordinates are required.');
  }
  if (!destination || !destination.coordinates || typeof destination.coordinates.lat !== 'number' || typeof destination.coordinates.lng !== 'number') {
    errors.push('Valid destination coordinates are required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;
  const errors = [];

  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateLovedOne, validateJourney, validateRating };
