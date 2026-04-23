import { HttpStatus } from '@nestjs/common';

export const ERROR_CODES = {
  // ─────────────────────────────────────────
  // AUTH - REGISTER (1000 – 1019)
  // ─────────────────────────────────────────
  AUTH_EMAIL_ALREADY_EXISTS: {
    code: 1001,
    message: 'Email đã tồn tại trên hệ thống.',
    status: HttpStatus.CONFLICT,
  },
  AUTH_PHONE_INVALID: {
    code: 1002,
    message:
      'Số điện thoại không hợp lệ. Định dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_PASSWORD_WEAK: {
    code: 1003,
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_REGISTER_FAILED: {
    code: 1004,
    message: 'Đăng ký thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // ─────────────────────────────────────────
  // AUTH - OTP / VERIFY (1020 – 1039)
  // ─────────────────────────────────────────
  AUTH_OTP_INVALID: {
    code: 1021,
    message: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_OTP_EXPIRED: {
    code: 1022,
    message: 'Mã OTP đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_ACCOUNT_NOT_FOUND: {
    code: 1023,
    message: 'Tài khoản không tồn tại.',
    status: HttpStatus.NOT_FOUND,
  },
  AUTH_OTP_LOCKED: {
    code: 1024,
    message: 'Tài khoản bị khóa do nhập sai OTP quá nhiều lần.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_OTP_RESEND_LIMIT_EXCEEDED: {
    code: 1025,
    message: 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_OTP_COOLDOWN: {
    code: 1026,
    message: 'Vui lòng đợi 60 giây trước khi yêu cầu OTP mới.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_USER_UNVERIFIED: {
    code: 1027,
    message: 'Tài khoản chưa được xác thực. Không thể thực hiện hành động này',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_USER_ALREADY_VERIFIED: {
    code: 1028,
    message: 'Tài khoản đã được xác thực. Không thể thực hiện hành động này',
    status: HttpStatus.CONFLICT,
  },
  AUTH_SIGN_KEY_INVALID: {
    code: 1029,
    message: 'Khoá xác thực (sign key) không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_LOCKED: {
    code: 1030,
    message:
      'Tài khoản người dùng đã bị khóa. Không thể thực hiện hành động này. Vui lòng liên hệ bộ phân hỗ trợ!',
    status: HttpStatus.FORBIDDEN,
  },

  // ─────────────────────────────────────────
  // AUTH - LOGIN (1040 – 1059)
  // ─────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS: {
    code: 1041,
    message: 'Email hoặc mật khẩu không chính xác.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_INACTIVE: {
    code: 1042,
    message: 'Tài khoản đã bị khóa hoặc ngừng hoạt động.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_LOGIN_FAILED: {
    code: 1043,
    message: 'Đăng nhập thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_LOGIN_LOCKED_10M: {
    code: 1044,
    message:
      'Tài khoản bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.',
    status: HttpStatus.FORBIDDEN,
  },

  // ─────────────────────────────────────────
  // AUTH - TOKEN (1060 – 1079)
  // ─────────────────────────────────────────
  AUTH_INVALID_TOKEN: {
    code: 1061,
    message: 'Token không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_INVALID_OR_EXPIRED: {
    code: 1062,
    message: 'Access token không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED: {
    code: 1063,
    message: 'Refresh token không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },

  // ─────────────────────────────────────────
  // AUTH - PASSWORD (1080 – 1099)
  // ─────────────────────────────────────────
  AUTH_CHANGE_PASSWORD_FAILED: {
    code: 1081,
    message: 'Đổi mật khẩu thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_OLD_PASSWORD_INCORRECT: {
    code: 1082,
    message: 'Mật khẩu cũ không chính xác.',
    status: HttpStatus.BAD_REQUEST,
  },

  // ─────────────────────────────────────────
  // USER (2000 – 2099)
  // ─────────────────────────────────────────
  USER_NOT_FOUND: {
    code: 2001,
    message: 'Không tìm thấy người dùng.',
    status: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXISTS: {
    code: 2002,
    message: 'Người dùng đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },

  // ─────────────────────────────────────────
  // JOB (2100 – 2199)
  // ─────────────────────────────────────────
  JOB_NOT_FOUND: {
    code: 2101,
    message: 'Không tìm thấy công việc.',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_ALREADY_EXISTS: {
    code: 2102,
    message: 'Công việc đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },
  JOB_CREATE_FAILED: {
    code: 2103,
    message: 'Tạo công việc thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_UPDATE_FAILED: {
    code: 2104,
    message: 'Cập nhật công việc thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_DELETE_FAILED: {
    code: 2105,
    message: 'Xóa công việc thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // ─────────────────────────────────────────
  // CV (2200 – 2299)
  // ─────────────────────────────────────────
  CV_NOT_FOUND: {
    code: 2201,
    message: 'Không tìm thấy CV.',
    status: HttpStatus.NOT_FOUND,
  },
  CV_ALREADY_EXISTS: {
    code: 2202,
    message: 'CV đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },
  CV_CREATE_FAILED: {
    code: 2203,
    message: 'Tạo CV thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_UPDATE_FAILED: {
    code: 2204,
    message: 'Cập nhật CV thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_DELETE_FAILED: {
    code: 2205,
    message: 'Xóa CV thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // ─────────────────────────────────────────
  // CAREER CATEGORY (2300 – 2399)
  // ─────────────────────────────────────────
  CAREER_CATEGORY_NOT_FOUND: {
    code: 2301,
    message: 'Không tìm thấy ngành nghề.',
    status: HttpStatus.NOT_FOUND,
  },
  CAREER_CATEGORY_ALREADY_EXISTS: {
    code: 2302,
    message: 'Ngành nghề đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },
  CAREER_CATEGORY_CREATE_FAILED: {
    code: 2303,
    message: 'Tạo ngành nghề thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_UPDATE_FAILED: {
    code: 2304,
    message: 'Cập nhật ngành nghề thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_DELETE_FAILED: {
    code: 2305,
    message: 'Xóa ngành nghề thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // ─────────────────────────────────────────
  // ROLE (3000 – 3099)
  // ─────────────────────────────────────────
  ROLE_UNABLE_TO_DETERMINE: {
    code: 3003,
    message: 'Không xác định được quyền hạn của người dùng.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_INSUFFICIENT_PERMISSIONS: {
    code: 3004,
    message: 'Bạn không có quyền thực hiện thao tác này.',
    status: HttpStatus.FORBIDDEN,
  },

  // ─────────────────────────────────────────
  // SYSTEM (9000 – 9999)
  // ─────────────────────────────────────────
  INVALID_OTP_TYPE: {
    code: 9000,
    message: 'Loại OTP không hợp lệ.',
    status: HttpStatus.BAD_REQUEST,
  },
  INTERNAL_SERVER_ERROR: {
    code: 9001,
    message: 'Lỗi hệ thống, vui lòng thử lại sau.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  VALIDATION_ERROR: {
    code: 9002,
    message: 'Dữ liệu không hợp lệ.',
    status: HttpStatus.BAD_REQUEST,
  },
};
