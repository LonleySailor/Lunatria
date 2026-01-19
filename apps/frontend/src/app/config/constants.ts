export const API_ENDPOINTS = {
  USERS: {
    BASE: '/users',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REGISTER: '/users/register',
    PROFILE_PICTURE: '/users/profile-picture',
  },
  SESSIONS: {
    BASE: '/sessions',
    IS_ACTIVE: '/sessions/issessionactive',
    GET_USER_INFO: '/sessions/getuserinfo',
  },
  SUPPORT: {
    BASE: '/support',
    IS_ADMIN: '/support/is-admin',
    SERVICES: '/support/services',
  },
  CREDENTIALS: {
    BASE: '/credentials',
    ADD: '/credentials/add',
  },
} as const;
