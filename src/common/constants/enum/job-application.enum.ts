export enum EJobApplicationStatus {
  APPLIED = 'APPLIED', // vừa apply
  REVIEWING = 'REVIEWING', // HR đang xem
  INTERVIEW = 'INTERVIEW', // đã lên lịch phỏng vấn
  REJECTED = 'REJECTED', // bị từ chối
  OFFERED = 'OFFERED', // HR gửi offer
  ACCEPTED = 'ACCEPTED', // ứng viên nhận việc
  WITHDRAWN = 'WITHDRAWN', // ứng viên rút CV
}
