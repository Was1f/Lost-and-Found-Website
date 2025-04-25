import jwt from 'jsonwebtoken';

// Admin Login Controller (simple, fixed)
export const adminLoginController = async (req, res) => {
  const { email, password } = req.body;

  // Check if the provided email and password match the admin credentials
  if (email === 'zidan@gmail.com' && password === '123') {
    // Generate JWT token for admin
    const token = jwt.sign(
      { adminId: 'admin-unique-id' },  // Static admin id
      'secret',  // <<< Static secret ONLY, no process.env
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Admin login successful',
      token,
    });
  }

  // If credentials do not match, return error
  return res.status(400).json({ message: 'Invalid credentials' });
};
