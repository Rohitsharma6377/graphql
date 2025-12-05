const express = require('express');

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const roomRoutes = require('./rooms');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;
