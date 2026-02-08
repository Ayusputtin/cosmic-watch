const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    // Case-insensitive check
    if (req.user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: `Access denied. Requires ${role} role.` });
    }
    next();
  };
};

module.exports = requireRole;
