const express = require('express');
const { body } = require('express-validator');
const { roomController } = require('../controllers');
const { protect, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const createRoomValidation = [
  body('name').trim().notEmpty().withMessage('Room name is required'),
  body('type').optional().isIn(['public', 'private', 'scheduled']).withMessage('Invalid room type'),
  body('maxParticipants').optional().isInt({ min: 2, max: 1000 }).withMessage('Max participants must be between 2 and 1000')
];

// Public routes (no authentication required)
router.get('/', roomController.getRooms); // Browse available rooms
router.get('/:roomId', roomController.getRoom); // View room details

// Protected routes (authentication required)
router.post('/', protect, createRoomValidation, validate, roomController.createRoom);
router.post('/:roomId/join', protect, roomController.joinRoom);
router.post('/:roomId/leave', protect, roomController.leaveRoom);
router.put('/:roomId/settings', protect, roomController.updateRoomSettings);
router.post('/:roomId/end', protect, roomController.endRoom);
router.get('/:roomId/messages', protect, roomController.getRoomMessages);
router.put('/:roomId/participants/:userId/media', protect, roomController.updateParticipantMedia);

module.exports = router;
