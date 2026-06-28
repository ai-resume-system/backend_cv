export enum EJobApplicationStatus {
  APPLIED = 'applied', // vừa apply
  INTERVIEW = 'interview', // đã lên lịch phỏng vấn
  ACCEPTED = 'accepted', // đạt phỏng vấn và nhận việc
  REJECTED = 'rejected', // bị từ chối
  WITHDRAWN = 'withdrawn', // ứng viên rút CV
}

export enum EInterviewType {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum EInterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
}
