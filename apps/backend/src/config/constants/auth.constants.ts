/**
 * Authentication & User-related constants
 */
export const AUTH_CONSTANTS = {
  // User types
  USER_TYPES: {
    ADMIN: 'admin',
    USER: 'user',
  } as const,

  // Routes
  ROUTES: {
    AUTH: 'auth',
    USERS: 'users',
    SESSIONS: 'sessions',
  } as const,

  // Controllers
  CONTROLLERS: {
    USERS: 'users',
    CREDENTIALS: 'credentials',
    AUDIT: 'audit',
    SESSIONS: 'sessions',
    SUPPORT: 'support',
  } as const,

  // Endpoints
  ENDPOINTS: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    REGISTER: 'register',
    DELETE_USER: 'delete-user',
    LOGOUT_JELLYFIN: 'logout-jellyfin',
    LOGOUT_RADARR: 'logout-radarr',
    LOGOUT_SONARR: 'logout-sonarr',
    GET_ALL_SESSIONS: 'getallsessions',
    CHECK_SESSION_ACTIVE: 'issessionactive',
    GET_USER_INFO: 'getuserinfo',
    DESTROY_ALL_SESSIONS: 'destroyallsessions',
  } as const,

  // Guard decorators
  DECORATORS: {
    SERVICE: 'service',
  } as const,

  // Local auth
  LOCAL_STRATEGY: 'local',

  // Bcrypt
  BCRYPT_ROUNDS: 10,

  // Encryption
  ENCRYPTION: {
    ALGORITHM: 'aes-256-cbc' as const,
  } as const,
} as const;
