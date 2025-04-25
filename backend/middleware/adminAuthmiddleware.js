import jwt from 'jsonwebtoken';

export const adminAuth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    console.log('❌ No token found in request header');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    console.log('✅ Token decoded:', decoded); // 👈 log decoded token
    req.admin = decoded.adminId;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message); // 👈 log exact issue
    res.status(401).json({ message: 'Token is not valid' });
  }
};
