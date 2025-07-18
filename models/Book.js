// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    required: true,
    unique: true,
  },
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: {
    type: Number,
    required: true,
    min: 1900
  },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('Book', bookSchema);
