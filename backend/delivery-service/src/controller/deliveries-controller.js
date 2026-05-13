const mongoose = require('mongoose');

const Delivery = require('../models/delivery');

const createFields = [
  'pickupAddress',
  'dropoffAddress',
  'customerName',
  'customerPhone',
  'price',
  'notes'
];

const businessUpdateFields = [
  'pickupAddress',
  'dropoffAddress',
  'customerName',
  'customerPhone',
  'price',
  'notes',
  'status'
];

const driverStatusTransitions = {
  ASSIGNED: 'PICKED_UP',
  PICKED_UP: 'ON_THE_WAY',
  ON_THE_WAY: 'DELIVERED'
};

const buildAllowedData = (source, allowedFields) => {
  const data = {};

  allowedFields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      data[field] = source[field];
    }
  });

  return data;
};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidId = id => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid delivery id.', 400);
  }
};

const ensureActiveDriver = user => {
  if (!user.isActive) {
    throw createError('Only active drivers can access this resource.', 403);
  }
};

const isOwnerBusiness = (delivery, userId) => {
  return delivery.businessId && delivery.businessId.toString() === userId;
};

const isAssignedDriver = (delivery, userId) => {
  return delivery.driverId && delivery.driverId.toString() === userId;
};

const normalizeError = err => {
  if (err.name === 'ValidationError') {
    err.statusCode = 422;
  }

  if (!err.statusCode) {
    err.statusCode = 500;
  }

  return err;
};

exports.getAllDeliveries = (req, res, next) => {
  let filter = null;

  if (req.user.role === 'BUSINESS') {
    filter = { businessId: req.user.id };
  } else if (req.user.role === 'DRIVER') {
    try {
      ensureActiveDriver(req.user);
    } catch (err) {
      return next(normalizeError(err));
    }

    filter = { status: 'READY_FOR_PICKUP', driverId: null };
  } else {
    return next(createError('Access denied.', 403));
  }

  Delivery.find(filter)
    .sort({ createdAt: -1 })
    .then(deliveries => {
      res.status(200).json({ deliveries: deliveries });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};

exports.createDelivery = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(createError('Authentication required.', 401));
  }

  const deliveryData = buildAllowedData(req.body, createFields);
  deliveryData.businessId = req.user.id;

  const delivery = new Delivery(deliveryData);

  delivery.save()
    .then(result => {
      res.status(201).json({
        message: 'Delivery created successfully.',
        delivery: result
      });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};

exports.getDeliveryById = (req, res, next) => {
  try {
    ensureValidId(req.params.id);
  } catch (err) {
    return next(normalizeError(err));
  }

  Delivery.findById(req.params.id)
    .then(delivery => {
      if (!delivery) {
        throw createError('Delivery not found.', 404);
      }

      if (req.user.role === 'BUSINESS') {
        if (!isOwnerBusiness(delivery, req.user.id)) {
          throw createError('Access denied.', 403);
        }
      } else if (req.user.role === 'DRIVER') {
        ensureActiveDriver(req.user);

        const isReadyForClaim =
          delivery.status === 'READY_FOR_PICKUP' && delivery.driverId === null;

        if (!isReadyForClaim && !isAssignedDriver(delivery, req.user.id)) {
          throw createError('Access denied.', 403);
        }
      } else {
        throw createError('Access denied.', 403);
      }

      res.status(200).json({ delivery: delivery });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};

exports.updateDelivery = (req, res, next) => {
  try {
    ensureValidId(req.params.id);
  } catch (err) {
    return next(normalizeError(err));
  }

  const updateData = buildAllowedData(req.body, businessUpdateFields);

  Delivery.findById(req.params.id)
    .then(delivery => {
      if (!delivery) {
        throw createError('Delivery not found.', 404);
      }

      if (!isOwnerBusiness(delivery, req.user.id)) {
        throw createError('Access denied.', 403);
      }

      if (delivery.driverId !== null) {
        throw createError('Claimed deliveries cannot be updated by the business.', 403);
      }

      if (Object.prototype.hasOwnProperty.call(updateData, 'status')) {
        const isValidBusinessStatusUpdate =
          delivery.status === 'CREATED' && updateData.status === 'READY_FOR_PICKUP';

        if (!isValidBusinessStatusUpdate) {
          throw createError('Business can only change status from CREATED to READY_FOR_PICKUP.', 422);
        }
      }

      Object.keys(updateData).forEach(field => {
        delivery[field] = updateData[field];
      });

      return delivery.save();
    })
    .then(updatedDelivery => {
      res.status(200).json({
        message: 'Delivery updated successfully.',
        delivery: updatedDelivery
      });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};

exports.deleteDelivery = (req, res, next) => {
  try {
    ensureValidId(req.params.id);
  } catch (err) {
    return next(normalizeError(err));
  }

  Delivery.findById(req.params.id)
    .then(delivery => {
      if (!delivery) {
        throw createError('Delivery not found.', 404);
      }

      if (!isOwnerBusiness(delivery, req.user.id)) {
        throw createError('Access denied.', 403);
      }

      if (delivery.driverId !== null) {
        throw createError('Claimed deliveries cannot be deleted by the business.', 403);
      }

      return Delivery.findByIdAndDelete(req.params.id);
    })
    .then(() => {
      res.status(200).json({ message: 'Delivery deleted successfully.' });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};

exports.claimDelivery = (req, res, next) => {
  try {
    ensureValidId(req.params.id);
    ensureActiveDriver(req.user);
  } catch (err) {
    return next(normalizeError(err));
  }

  Delivery.findOneAndUpdate(
    {
      _id: req.params.id,
      status: 'READY_FOR_PICKUP',
      driverId: null
    },
    {
      $set: {
        driverId: req.user.id,
        status: 'ASSIGNED'
      }
    },
    {
      new: true
    }
  )
    .then(delivery => {
      if (delivery) {
        res.status(200).json({
          message: 'Delivery claimed successfully.',
          delivery: delivery
        });
        return null;
      }

      return Delivery.findById(req.params.id).then(existingDelivery => {
        if (!existingDelivery) {
          throw createError('Delivery not found.', 404);
        }

        throw createError('Delivery is no longer available for claim.', 409);
      });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};

exports.updateDeliveryStatus = (req, res, next) => {
  try {
    ensureValidId(req.params.id);
    ensureActiveDriver(req.user);
  } catch (err) {
    return next(normalizeError(err));
  }

  const nextStatus = req.body.status;

  if (!nextStatus) {
    return next(createError('Status is required.', 422));
  }

  Delivery.findById(req.params.id)
    .then(delivery => {
      if (!delivery) {
        throw createError('Delivery not found.', 404);
      }

      if (!isAssignedDriver(delivery, req.user.id)) {
        throw createError('Access denied.', 403);
      }

      const expectedNextStatus = driverStatusTransitions[delivery.status];

      if (!expectedNextStatus || nextStatus !== expectedNextStatus) {
        throw createError('Invalid delivery status transition.', 422);
      }

      delivery.status = nextStatus;
      return delivery.save();
    })
    .then(updatedDelivery => {
      res.status(200).json({
        message: 'Delivery status updated successfully.',
        delivery: updatedDelivery
      });
    })
    .catch(err => {
      next(normalizeError(err));
    });
};
