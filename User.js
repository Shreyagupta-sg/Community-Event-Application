const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: true,
    trim:     true
  },
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true
  },
  passwordHash: {
    type:     String,
    required: true
  },
  role: {
    type:    String,
    enum:    ['organizer','volunteer'],
    default: 'volunteer'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
