const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const deliveriesController = require('../controller/deliveries-controller');

router.get('/', authMiddleware.requireAuth, deliveriesController.getAllDeliveries);
router.post(
  '/',
  authMiddleware.requireAuth,
  roleMiddleware.requireRole('BUSINESS'),
  deliveriesController.createDelivery
);
router.get('/:id', authMiddleware.requireAuth, deliveriesController.getDeliveryById);
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
