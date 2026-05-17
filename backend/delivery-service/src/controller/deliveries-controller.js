const Delivery = require('../models/Delivery');

exports.getMyDeliveries = (req, res, next) => {
  const userId = req.user.id;
  if (!userId) {
    const error = new Error('User ID not found in token.');
    error.statusCode = 401;
    return next(error);
  }

  Delivery.find({ businessId: userId })
    .then(deliveries => {
      res.status(200).json({
        message: 'Deliveries retrieved successfully', 
        deliveries: deliveries });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};  

exports.getAllDeliveries = (req, res, next) => {
  if (!req.user.isActive) {
    const error = new Error('Only active drivers can access this resource.');
    error.statusCode = 403;
    return next(error);
  }

  Delivery.find({ status: 'READY_FOR_PICKUP' ,driverId: null})
    .then(deliveries => {
      if (deliveries.length === 0) {
        return res.status(200).json({
          message: 'No deliveries available for pickup.',
          deliveries: []
        });
      }
      res.status(200).json({
        message: 'Deliveries retrieved successfully', 
        deliveries: deliveries });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.createDelivery = (req, res, next) => {
  const pickupAddress = req.body.pickupAddress;
  const dropoffAddress = req.body.dropoffAddress;
  const customerName = req.body.customerName;
  const customerPhone = req.body.customerPhone;
  const price = req.body.price;
  const notes = req.body.notes;

  const delivery = new Delivery({
    businessId: req.user.id,
    pickupAddress: pickupAddress,
    dropoffAddress: dropoffAddress,
    customerName: customerName,
    customerPhone: customerPhone,
    price: price,
    notes: notes
  });

  delivery
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Delivery created successfully!',
        delivery: result
      });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.getMyDeliveryById = (req, res, next) => {
  const deliveryId = req.params.id;

  Delivery.findOne({ _id: deliveryId, businessId: req.user.id })
    .then(delivery => {
      if (!delivery) {
        const error = new Error('Delivery not found.');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ delivery: delivery });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.getDriverDeliveryById = (req, res, next) => {
  const deliveryId = req.params.id;

  if (!req.user.isActive) {
    const error = new Error('Only active drivers can access this resource.');
    error.statusCode = 403;
    return next(error);
  }

  Delivery.findById(deliveryId)
    .then(delivery => {
      if (!delivery) {
        const error = new Error('Delivery not found.');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ delivery: delivery });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.updateDelivery = (req, res, next) => {
  const deliveryId = req.params.id;
  const pickupAddress = req.body.pickupAddress;
  const dropoffAddress = req.body.dropoffAddress;
  const customerName = req.body.customerName;
  const customerPhone = req.body.customerPhone;
  const price = req.body.price;
  const notes = req.body.notes;
  const status = req.body.status;

  Delivery.findById(deliveryId)
    .then(delivery => {
      if (!delivery) {
        const error = new Error('Delivery not found.');
        error.statusCode = 404;
        throw error;
      }

      if (!delivery.businessId || delivery.businessId.toString() !== req.user.id) {
        const error = new Error('Access denied.');
        error.statusCode = 403;
        throw error;
      }

      if (delivery.driverId !== null) {
        const error = new Error('Claimed deliveries cannot be updated.');
        error.statusCode = 403;
        throw error;
      }

      if (pickupAddress !== undefined) {
        delivery.pickupAddress = pickupAddress;
      }

      if (dropoffAddress !== undefined) {
        delivery.dropoffAddress = dropoffAddress;
      }

      if (customerName !== undefined) {
        delivery.customerName = customerName;
      }

      if (customerPhone !== undefined) {
        delivery.customerPhone = customerPhone;
      }

      if (price !== undefined) {
        delivery.price = price;
      }

      if (notes !== undefined) {
        delivery.notes = notes;
      }

      if (status !== undefined) {
        if (delivery.status !== 'CREATED' || status !== 'READY_FOR_PICKUP') {
          const error = new Error('Business can only change status from CREATED to READY_FOR_PICKUP.');
          error.statusCode = 422;
          throw error;
        }

        delivery.status = status;
      }

      return delivery.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Delivery updated successfully!',
        delivery: result
      });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.deleteDelivery = (req, res, next) => {
  const deliveryId = req.params.id;

  Delivery.findById(deliveryId)
    .then(delivery => {
      if (!delivery) {
        const error = new Error('Delivery not found.');
        error.statusCode = 404;
        throw error;
      }

      if (!delivery.businessId || delivery.businessId.toString() !== req.user.id) {
        const error = new Error('Access denied.');
        error.statusCode = 403;
        throw error;
      }

      if (delivery.driverId !== null) {
        const error = new Error('Claimed deliveries cannot be deleted.');
        error.statusCode = 403;
        throw error;
      }

      return Delivery.findByIdAndDelete(deliveryId);
    })
    .then(() => {
      res.status(200).json({ 
        message: 'Delivery deleted successfully! with id: ' + deliveryId
      });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.claimDelivery = (req, res, next) => {
  const deliveryId = req.params.id;

  if (!req.user.isActive) {
    const error = new Error('Only active drivers can claim deliveries.');
    error.statusCode = 403;
    return next(error);
  }

  Delivery.findOneAndUpdate(
    {
      _id: deliveryId,
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
        return res.status(200).json({
          message: 'Delivery claimed successfully!',
          delivery: delivery
        });
      }

      return Delivery.findById(deliveryId).then(existingDelivery => {
        if (!existingDelivery) {
          const error = new Error('Delivery not found.');
          error.statusCode = 404;
          throw error;
        }

        const error = new Error('Delivery is no longer available for claim.');
        error.statusCode = 409;
        throw error;
      });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};

exports.updateDeliveryStatus = (req, res, next) => {
  const deliveryId = req.params.id;
  const status = req.body.status;

  if (!req.user.isActive) {
    const error = new Error('Only active drivers can update delivery status.');
    error.statusCode = 403;
    return next(error);
  }

  if (!status) {
    const error = new Error('Status is required.');
    error.statusCode = 422;
    return next(error);
  }

  Delivery.findById(deliveryId)
    .then(delivery => {
      if (!delivery) {
        const error = new Error('Delivery not found.');
        error.statusCode = 404;
        throw error;
      }

      if (!delivery.driverId || delivery.driverId.toString() !== req.user.id) {
        const error = new Error('Access denied.');
        error.statusCode = 403;
        throw error;
      }

      if (
        (delivery.status === 'ASSIGNED' && status !== 'PICKED_UP') ||
        (delivery.status === 'PICKED_UP' && status !== 'ON_THE_WAY') ||
        (delivery.status === 'ON_THE_WAY' && status !== 'DELIVERED') ||
        (delivery.status !== 'ASSIGNED' &&
          delivery.status !== 'PICKED_UP' &&
          delivery.status !== 'ON_THE_WAY')
      ) {
        const error = new Error('Invalid delivery status transition.');
        error.statusCode = 422;
        throw error;
      }

      delivery.status = status;
      return delivery.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Delivery status updated successfully!',
        delivery: result
      });
    })
    .catch(err => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 422;
      }
      next(err);
    });
};
