// index.js - Book Manager API sử dụng MongoDB và mô tả Swagger đầy đủ

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const logger = require('./middlewares/logger');
const contentTypeCheck = require('./middlewares/contentTypeCheck');
const { swaggerUi, swaggerSpec } = require('./swagger');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/bookmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Book = require('./models/Book');

app.use(express.json());
app.use(logger);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Lấy tất cả sách (có thể phân trang)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách sách
 */
app.get('/books', async (req, res) => {
  const { page, limit } = req.query;
  const query = Book.find();

  if (page && limit) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query.skip(skip).limit(parseInt(limit));
  }

  const books = await query.exec();
  res.json(books);
});

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Tìm sách theo chuyên mục (không phân biệt chữ hoa/thường)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách sách theo chuyên mục
 */
app.get('/books/search', async (req, res) => {
  const category = req.query.category?.toLowerCase();
  const books = await Book.find({ category: new RegExp(`^${category}$`, 'i') });
  res.json(books);
});

/**
 * @swagger
 * /books/sort:
 *   get:
 *     summary: Sắp xếp sách theo tiêu chí (title hoặc year)
 *     parameters:
 *       - in: query
 *         name: by
 *         schema:
 *           type: string
 *           enum: [title, year]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Danh sách sách đã sắp xếp
 */
app.get('/books/sort', async (req, res) => {
  const { by, order } = req.query;
  if (!['title', 'year'].includes(by)) return res.status(400).json({ message: 'Invalid sort field' });

  const sortObj = {};
  sortObj[by] = order === 'desc' ? -1 : 1;

  const books = await Book.find().sort(sortObj);
  res.json(books);
});

/**
 * @swagger
 * /books/filter:
 *   get:
 *     summary: Tìm sách nâng cao theo author và year
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách sách phù hợp
 */
app.get('/books/filter', async (req, res) => {
  const { author, year } = req.query;
  const filter = {};

  if (author) filter.author = new RegExp(author, 'i');
  if (year) filter.year = parseInt(year);

  const books = await Book.find(filter);
  res.json(books);
});

/**
 * @swagger
 * /books/{isbn}:
 *   get:
 *     summary: Lấy sách theo ISBN
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin sách
 *       404:
 *         description: Không tìm thấy
 */
app.get('/books/:isbn', async (req, res) => {
  const book = await Book.findOne({ isbn: req.params.isbn });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Thêm mới sách
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Thêm thành công
 *       400:
 *         description: Lỗi dữ liệu
 */
app.post('/books', contentTypeCheck, async (req, res) => {
  const { isbn, title, author, year, category } = req.body;

  if (!isbn || !title || !author || !category || !Number.isInteger(year) || year < 1900) {
    return res.status(400).json({ message: 'Invalid book data' });
  }

  const exists = await Book.findOne({ isbn });
  if (exists) return res.status(400).json({ message: 'ISBN already exists' });

  const book = new Book({ isbn, title, author, year, category });
  await book.save();

  res.status(201).json(book);
});

/**
 * @swagger
 * /books/{isbn}:
 *   put:
 *     summary: Cập nhật sách theo ISBN
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
app.put('/books/:isbn', contentTypeCheck, async (req, res) => {
  const { title, author, year, category } = req.body;
  const book = await Book.findOne({ isbn: req.params.isbn });
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (!title || !author || !category || !Number.isInteger(year) || year < 1900) {
    return res.status(400).json({ message: 'Invalid book data' });
  }

  book.title = title;
  book.author = author;
  book.year = year;
  book.category = category;
  book.updatedAt = new Date();

  await book.save();
  res.json(book);
});

/**
 * @swagger
 * /books/{isbn}:
 *   delete:
 *     summary: Xoá sách theo ISBN
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy
 */
app.delete('/books/:isbn', async (req, res) => {
  const book = await Book.findOneAndDelete({ isbn: req.params.isbn });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ message: 'Book deleted' });
});

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Thống kê tổng số sách, sách cũ nhất, mới nhất
 *     responses:
 *       200:
 *         description: Thông tin thống kê
 */
app.get('/stats', async (req, res) => {
  const books = await Book.find();
  if (books.length === 0) return res.json({ totalBooks: 0 });

  const years = books.map(b => b.year);
  res.json({
    totalBooks: books.length,
    oldestBook: Math.min(...years),
    newestBook: Math.max(...years)
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Book Manager API with MongoDB running at http://localhost:${PORT}`);
});

