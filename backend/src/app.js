const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

dotenv.config();

const app = express();

// Static Folder for Uploads
app.use('/uploads', express.static('uploads'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'AppDatMon API Docs'
}));

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

const adminDir = path.join(__dirname, '..', '..', 'admin');
app.use('/admin', express.static(adminDir, { etag: false, maxAge: 0, setHeaders: (res) => { res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); } }));
app.get('/admin', (req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
});
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample Route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to AppDatMon API" });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pointRoutes = require('./routes/pointRoutes');
const statRoutes = require('./routes/statRoutes');
const payosRoutes = require('./routes/payosRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/payos', payosRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: err.message
    });
});

module.exports = app;
