export const validateSignup = (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({ error: 'Name must be 20-60 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      error: 'Password must be 8-16 characters with 1 uppercase letter and 1 special character' 
    });
  }

  if (address && address.length > 400) {
    return res.status(400).json({ error: 'Address must be max 400 characters' });
  }

  next();
};
