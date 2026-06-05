export enum EJobStatus {
  DRAFT = 'draft', // Bản nháp
  PENDING = 'pending', // Chờ duyệt
  OPEN = 'open', // Đang mở
  CLOSED = 'closed', // Đã đóng
  REJECTED = 'rejected', // Đã từ chối
  EXPIRED = 'expired', // Hết hạn
}

export enum EJobType {
  FULL_TIME = 'full_time', // Toàn thời gian
  PART_TIME = 'part_time', // Bán thời gian
  INTERNSHIP = 'internship', // Thực tập
}

export enum EJobEducationLevel {
  NONE = 'none', // Không yêu cầu
  COLLEGE = 'college', // Cao đẳng
  UNIVERSITY = 'university', // Đại học
  POSTGRADUATE = 'postgraduate', // Sau đại học
}

export enum EJobWorkArrangement {
  ONSITE = 'onsite', // Tại văn phòng
  HYBRID = 'hybrid', // Kết hợp
  REMOTE = 'remote', // Làm việc từ xa
}

export enum EJobAction {
  DRAFT = 'draft', // Tạo bản nháp
  SUBMIT = 'submit', // Gửi
}
