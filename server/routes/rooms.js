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

// Protect all routes
router.use(protect);

// Routes
router.post('/', createRoomValidation, validate, roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoom);
router.post('/:roomId/join', roomController.joinRoom);
router.post('/:roomId/leave', roomController.leaveRoom);
router.put('/:roomId/settings', roomController.updateRoomSettings);
router.post('/:roomId/end', roomController.endRoom);
router.get('/:roomId/messages', roomController.getRoomMessages);
router.put('/:roomId/participants/:userId/media', roomController.updateParticipantMedia);

module.exports = router;
