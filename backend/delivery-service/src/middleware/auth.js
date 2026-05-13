const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'somesupersecretsecret');

    req.user = {
      id: decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      isActive: decoded.isActive
    };

    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
