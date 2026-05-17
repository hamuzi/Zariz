const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const deliveriesController = require('../controller/deliveries-controller');

router.get(
  '/me',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('BUSINESS'),
  deliveriesController.getMyDeliveries
);
router.get(
  '/all',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('DRIVER'),
  deliveriesController.getAllDeliveries
);
router.get(
  '/me/:id',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('BUSINESS'),
  deliveriesController.getMyDeliveryById
);
router.get(
  '/all/:id',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('DRIVER'),
  deliveriesController.getDriverDeliveryById
);
router.post(
  '/',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('BUSINESS'),
  deliveriesController.createDelivery
);
router.put(
  '/:id',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('BUSINESS'),
  deliveriesController.updateDelivery
);
router.delete(
  '/:id',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('BUSINESS'),
  deliveriesController.deleteDelivery
);
router.patch(
  '/:id/claim',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('DRIVER'),
  deliveriesController.claimDelivery
);
router.patch(
  '/:id/status',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('DRIVER'),
  deliveriesController.updateDeliveryStatus
);

module.exports = router;
