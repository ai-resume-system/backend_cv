import { HttpStatus } from '@nestjs/common';

export const ERROR_CODES = {
  // AUTH - REGISTER
  AUTH_EMAIL_ALREADY_EXISTS: {
    message: 'Email đã tồn tại trên hệ thống.',
    status: HttpStatus.CONFLICT,
  },
  AUTH_PHONE_INVALID: {
    message:
      'Số điện thoại không hợp lệ. Định dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_PASSWORD_WEAK: {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_REGISTER_FAILED: {
    message: 'Đăng ký thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // AUTH - OTP / VERIFY
  INVALID_OTP_TYPE: {
    message: 'Loại OTP không hợp lệ.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_OTP_INVALID: {
    message: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_OTP_EXPIRED: {
    message: 'Mã OTP đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_ACCOUNT_NOT_FOUND: {
    message: 'Tài khoản không tồn tại.',
    status: HttpStatus.NOT_FOUND,
  },
  AUTH_OTP_LOCKED: {
    message: 'Tài khoản bị khóa do nhập sai OTP quá nhiều lần.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_OTP_RESEND_LIMIT_EXCEEDED: {
    message: 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_OTP_COOLDOWN: {
    message: 'Vui lòng đợi 60 giây trước khi yêu cầu OTP mới.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_USER_UNVERIFIED: {
    message: 'Tài khoản chưa được xác thực. Không thể thực hiện hành động này',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_USER_ALREADY_VERIFIED: {
    message: 'Tài khoản đã được xác thực. Không thể thực hiện hành động này',
    status: HttpStatus.CONFLICT,
  },
  AUTH_SIGN_KEY_INVALID: {
    message: 'Khoá xác thực (sign key) không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_LOCKED: {
    message:
      'Tài khoản người dùng đã bị khóa. Không thể thực hiện hành động này. Vui lòng liên hệ bộ phân hỗ trợ!',
    status: HttpStatus.FORBIDDEN,
  },

  // AUTH - LOGIN
  AUTH_INVALID_CREDENTIALS: {
    message: 'Email hoặc mật khẩu không chính xác.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_INACTIVE: {
    message: 'Tài khoản đã bị khóa hoặc ngừng hoạt động.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_LOGIN_FAILED: {
    message: 'Đăng nhập thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_LOGIN_LOCKED_10M: {
    message:
      'Tài khoản bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.',
    status: HttpStatus.FORBIDDEN,
  },

  // AUTH - TOKEN
  AUTH_INVALID_TOKEN: {
    message: 'Token không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_INVALID_OR_EXPIRED: {
    message: 'Access token không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED: {
    message: 'Refresh token không hợp lệ hoặc đã hết hạn.',
    status: HttpStatus.UNAUTHORIZED,
  },

  // AUTH - PASSWORD
  AUTH_CHANGE_PASSWORD_FAILED: {
    message: 'Đổi mật khẩu thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_OLD_PASSWORD_INCORRECT: {
    message: 'Mật khẩu cũ không chính xác.',
    status: HttpStatus.BAD_REQUEST,
  },

  // USER
  USER_NOT_FOUND: {
    message: 'Không tìm thấy người dùng.',
    status: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXISTS: {
    message: 'Người dùng đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },

  // JOB
  JOB_NOT_FOUND: {
    message: 'Không tìm thấy công việc.',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_ALREADY_EXISTS: {
    message: 'Công việc đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },
  JOB_CREATE_FAILED: {
    message: 'Tạo công việc thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_UPDATE_FAILED: {
    message: 'Cập nhật công việc thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_DELETE_FAILED: {
    message: 'Xóa công việc thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // CV
  CV_NOT_FOUND: {
    message: 'Không tìm thấy CV.',
    status: HttpStatus.NOT_FOUND,
  },
  CV_ALREADY_EXISTS: {
    message: 'CV đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },
  CV_CREATE_FAILED: {
    message: 'Tạo CV thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_UPDATE_FAILED: {
    message: 'Cập nhật CV thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_DELETE_FAILED: {
    message: 'Xóa CV thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_FILE_TOO_LARGE: {
    message: 'Dung lượng file CV tối đa 5MB.',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_FILE_TYPE_INVALID: {
    message: 'Định dạng file không hợp lệ. Chỉ chấp nhận PDF, DOC, DOCX.',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_ACCESS_DENIED: {
    message: 'Bạn không có quyền truy cập CV này.',
    status: HttpStatus.FORBIDDEN,
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Đã vượt quá số lần tải file trong 1 phút. Vui lòng thử lại sau.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  // CV ANALYSIS
  CV_ANALYSIS_ALREADY_PROCESSING_ERROR: {
    message: 'CV dang duoc phan tich. Vui long doi job hien tai hoan tat.',
    status: HttpStatus.CONFLICT,
  },

  CV_ANALYSIS_FILE_MISSING_ERROR: {
    message: 'CV khong co file hop le de thuc hien phan tich.',
    status: HttpStatus.BAD_REQUEST,
  },

  CV_ANALYSIS_TRIGGER_FAILED_ERROR: {
    message: 'Khong the khoi tao qua trinh phan tich CV.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // CAREER CATEGORY
  CAREER_CATEGORY_NOT_FOUND: {
    message: 'Không tìm thấy ngành nghề.',
    status: HttpStatus.NOT_FOUND,
  },
  CAREER_CATEGORY_ALREADY_EXISTS: {
    message: 'Ngành nghề đã tồn tại.',
    status: HttpStatus.CONFLICT,
  },
  CAREER_CATEGORY_CREATE_FAILED: {
    message: 'Tạo ngành nghề thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_UPDATE_FAILED: {
    message: 'Cập nhật ngành nghề thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_DELETE_FAILED: {
    message: 'Xóa ngành nghề thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // JOB APPLICATION
  JOB_APPLICATION_NOT_FOUND: {
    message: 'Không tìm thấy đơn ứng tuyển.',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_APPLICATION_ALREADY_EXISTS: {
    message: 'Bạn đã ứng tuyển công việc này rồi.',
    status: HttpStatus.CONFLICT,
  },
  JOB_APPLICATION_CREATE_FAILED: {
    message: 'Ứng tuyển thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_UPDATE_FAILED: {
    message: 'Cập nhật đơn ứng tuyển thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_WITHDRAW_FAILED: {
    message: 'Rút đơn ứng tuyển thất bại.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_JOB_NOT_OPEN: {
    message: 'Công việc này không còn nhận ứng viên.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_JOB_EXPIRED: {
    message: 'Công việc này đã hết hạn ứng tuyển.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_CV_IN_USE: {
    message: 'CV này đang được sử dụng cho đơn ứng tuyển khác.',
    status: HttpStatus.CONFLICT,
  },
  JOB_APPLICATION_CANNOT_WITHDRAW: {
    message: 'Không thể rút đơn. Đơn đã được chuyển trạng thái.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_STATUS_INVALID: {
    message: 'Trạng thái đơn ứng tuyển không hợp lệ.',
    status: HttpStatus.BAD_REQUEST,
  },

  // MEDIA / ROLE
  MEDIA_FILE_REQUIRED: {
    message: 'File tai len khong duoc de trong.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_FILE_TOO_LARGE: {
    message: 'Dung luong file toi da 5MB.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_FILE_TYPE_INVALID: {
    message: 'Dinh dang file khong hop le. Chi chap nhan file anh.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_TYPE_INVALID: {
    message: 'Loai media khong hop le.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_UPLOAD_FAILED: {
    message: 'Tai media that bai.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_UNABLE_TO_DETERMINE: {
    message: 'Không xác định được quyền hạn của người dùng.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_INSUFFICIENT_PERMISSIONS: {
    message: 'Bạn không có quyền thực hiện thao tác này.',
    status: HttpStatus.FORBIDDEN,
  },

  // SYSTEM
  IP_NOT_FOUND: {
    message: 'Không tìm thấy IP.',
    status: HttpStatus.NOT_FOUND,
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Lỗi hệ thống, vui lòng thử lại sau.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  VALIDATION_ERROR: {
    message: 'Dữ liệu không hợp lệ.',
    status: HttpStatus.BAD_REQUEST,
  },
  SYSTEM_BUSY: {
    message: 'Hệ thống bận, vui lòng thử lại sau.',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  },
} as const;
