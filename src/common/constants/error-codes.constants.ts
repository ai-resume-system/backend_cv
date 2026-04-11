export const ERROR_CODES = {
  // ─────────────────────────────────────────
  // AUTH - REGISTER (1000 – 1019)
  // ─────────────────────────────────────────
  AUTH_EMAIL_ALREADY_EXISTS: {
    code: 1001,
    message: 'Email đã tồn tại trên hệ thống.',
  },
  AUTH_PASSWORD_WEAK: {
    code: 1002,
    message: 'Mật khẩu không đủ mạnh.',
  },
  AUTH_REGISTER_FAILED: {
    code: 1003,
    message: 'Đăng ký thất bại.',
  },
  AUTH_PHONE_INVALID: {
    code: 1004,
    message: 'Số điện thoại không hợp lệ.',
  },

  // ─────────────────────────────────────────
  // AUTH - OTP / VERIFY (1020 – 1039)
  // ─────────────────────────────────────────
  AUTH_OTP_INVALID: {
    code: 1021,
    message: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
  },
  AUTH_OTP_EXPIRED: {
    code: 1022,
    message: 'Mã OTP đã hết hạn.',
  },
  AUTH_OTP_LOCKED: {
    code: 1023,
    message: 'Tài khoản bị khóa do nhập sai OTP quá nhiều lần.',
  },
  AUTH_USER_UNVERIFIED: {
    code: 1024,
    message: 'Tài khoản chưa được xác thực.',
  },

  // ─────────────────────────────────────────
  // AUTH - LOGIN (1040 – 1059)
  // ─────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS: {
    code: 1041,
    message: 'Email hoặc mật khẩu không chính xác.',
  },
  AUTH_USER_INACTIVE: {
    code: 1042,
    message: 'Tài khoản đã bị khóa hoặc ngừng hoạt động.',
  },
  AUTH_LOGIN_FAILED: {
    code: 1043,
    message: 'Đăng nhập thất bại.',
  },

  // ─────────────────────────────────────────
  // AUTH - TOKEN (1060 – 1079)
  // ─────────────────────────────────────────
  AUTH_INVALID_TOKEN: {
    code: 1061,
    message: 'Token không hợp lệ hoặc đã hết hạn.',
  },
  AUTH_REFRESH_TOKEN_INVALID: {
    code: 1062,
    message: 'Refresh token không hợp lệ.',
  },
  AUTH_REFRESH_TOKEN_EXPIRED: {
    code: 1063,
    message: 'Refresh token đã hết hạn.',
  },

  // ─────────────────────────────────────────
  // AUTH - PASSWORD (1080 – 1099)
  // ─────────────────────────────────────────
  AUTH_CHANGE_PASSWORD_FAILED: {
    code: 1081,
    message: 'Đổi mật khẩu thất bại.',
  },
  AUTH_OLD_PASSWORD_INCORRECT: {
    code: 1082,
    message: 'Mật khẩu cũ không chính xác.',
  },

  // ─────────────────────────────────────────
  // USER (2000 – 2099)
  // ─────────────────────────────────────────
  USER_NOT_FOUND: {
    code: 2001,
    message: 'Không tìm thấy người dùng.',
  },
  USER_ALREADY_EXISTS: {
    code: 2002,
    message: 'Người dùng đã tồn tại.',
  },

  // ─────────────────────────────────────────
  // ROLE (3000 – 3099)
  // ─────────────────────────────────────────
  ROLE_NOT_FOUND: {
    code: 3001,
    message: 'Không tìm thấy quyền hạn yêu cầu.',
  },
  ROLE_INVALID: {
    code: 3002,
    message: 'Quyền hạn không hợp lệ.',
  },

  // ─────────────────────────────────────────
  // SYSTEM (9000 – 9999)
  // ─────────────────────────────────────────
  INTERNAL_SERVER_ERROR: {
    code: 9000,
    message: 'Lỗi hệ thống, vui lòng thử lại sau.',
  },
  VALIDATION_ERROR: {
    code: 9001,
    message: 'Dữ liệu không hợp lệ.',
  },
};
