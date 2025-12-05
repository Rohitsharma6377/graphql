// Format time duration
exports.formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user object
exports.sanitizeUser = (user) => {
  const sanitized = user.toObject();
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

// Calculate pagination
exports.getPagination = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// API response format
exports.successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

exports.errorResponse = (message = 'Error', errors = []) => {
  return {
    success: false,
    message,
    errors
  };
};
