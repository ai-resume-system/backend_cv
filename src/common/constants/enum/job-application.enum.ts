export enum EJobApplicationStatus {
  APPLIED = 'applied', // vừa apply
  REVIEWING = 'reviewing', // HR đang xem
  INTERVIEW = 'interview', // đã lên lịch phỏng vấn
  REJECTED = 'rejected', // bị từ chối
  OFFERED = 'offered', // HR gửi offer
  ACCEPTED = 'accepted', // ứng viên nhận việc
  WITHDRAWN = 'withdrawn', // ứng viên rút CV
}
