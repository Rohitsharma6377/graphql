const express = require('express');
const { adminController } = require('../controllers');
const { protect, authorize } = require('../middleware');

const router = express.Router();

// Protect all routes and restrict to admin only
router.use(protect);
router.use(authorize('admin'));

// Dashboard & Stats
router.get('/stats', adminController.getDashboardStats);
router.get('/logs', adminController.getSystemLogs);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/account-type', adminController.updateAccountType);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Room Management
router.get('/rooms', adminController.getAllRooms);
router.delete('/rooms/:id', adminController.deleteRoom);

module.exports = router;
