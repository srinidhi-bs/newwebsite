// Application configuration

export const EMAIL_CONFIG = {
  // List of allowed email domains for automatic approval
  ALLOWED_DOMAINS: [
    'srinidhibs.com',      // Main company domain
    'enterprise.com',       // Example enterprise domain
  ],
  
  // Admin email addresses that can access the admin dashboard
  ADMIN_EMAILS: [
    'mailsrinidhibs@gmail.com',  // Your admin email
  ]
};

export const AUTH_CONFIG = {
  // Minimum password length
  MIN_PASSWORD_LENGTH: 8,
  
  // User roles
  ROLES: {
    ADMIN: 'admin',
    CLIENT: 'client',
    PENDING: 'pending'
  }
};

export const UI_CONFIG = {
  // Number of items per page in admin dashboard
  ITEMS_PER_PAGE: 10
};
