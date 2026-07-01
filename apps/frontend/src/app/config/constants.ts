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
  ADMIN: {
    BASE: '/admin',
    SERVICES: '/admin/services',
    USERS_WITHOUT_CREDENTIAL: '/admin/users-without-credential',
    REGISTER_CREDENTIAL: '/admin/register-credential',
    USERS_WITHOUT_ACCESS: '/admin/users-without-access',
    GRANT_ACCESS: '/admin/grant-access',
    USERS_WITH_ACCESS: '/admin/users-with-access',
    REVOKE_ACCESS: '/admin/revoke-access',
    USERS_WITH_CREDENTIAL: '/admin/users-with-credential',
    REVOKE_CREDENTIAL: '/admin/revoke-credential',
  },
} as const;
