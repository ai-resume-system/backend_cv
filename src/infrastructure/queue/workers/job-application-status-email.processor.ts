import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { MailService } from 'src/infrastructure/mail/mail.service';
import {
  IJobApplicationStatusEmailJob,
  JOB_APPLICATION_STATUS_EMAIL_DLQ,
  JOB_APPLICATION_STATUS_EMAIL_QUEUE,
} from '../queue.constants';

@Processor(JOB_APPLICATION_STATUS_EMAIL_QUEUE)
export class JobApplicationStatusEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(JobApplicationStatusEmailProcessor.name);

  constructor(
    private readonly mailService: MailService,
    @InjectQueue(JOB_APPLICATION_STATUS_EMAIL_DLQ)
    private readonly dlq: Queue<IJobApplicationStatusEmailJob>,
  ) {
    super();
  }

  async process(job: Job<IJobApplicationStatusEmailJob>): Promise<void> {
    try {
      const subject = this.buildSubject(job.data);
      const html = this.buildHtml(job.data);
      await this.mailService.sendEmail(job.data.to, subject, html);
    } catch (error) {
      this.logger.error(
        `Job application status email failed: ${error.message}`,
        error.stack,
      );
      if ((job.attemptsMade || 0) + 1 >= (job.opts.attempts || 1)) {
        await this.dlq.add('send.failed', job.data, {
          removeOnComplete: false,
        });
      }
      throw error;
    }
  }

  private buildSubject(data: IJobApplicationStatusEmailJob): string {
    switch (data.status) {
      case EJobApplicationStatus.INTERVIEW:
        return `Thư mời phỏng vấn - ${data.jobTitle}`;
      case EJobApplicationStatus.OFFERED:
        return `Thông báo kết quả tuyển dụng - ${data.jobTitle}`;
      default:
        return `Cập nhật hồ sơ ứng tuyển - ${data.jobTitle}`;
    }
  }

  private buildHtml(data: IJobApplicationStatusEmailJob): string {
    const greeting = data.fullName
      ? `Chào ${data.fullName},`
      : 'Chào bạn,';
    const companyName = data.name || 'quý công ty';
    const headerTitle =
      data.status === EJobApplicationStatus.INTERVIEW
        ? 'Thư mời phỏng vấn'
        : data.status === EJobApplicationStatus.OFFERED
          ? 'Thông báo kết quả tuyển dụng'
          : 'Cập nhật hồ sơ ứng tuyển';
    const intro =
      data.status === EJobApplicationStatus.INTERVIEW
        ? `Hồ sơ ứng tuyển vị trí <strong>${data.jobTitle}</strong> tại <strong>${companyName}</strong> của bạn đã được chuyển sang vòng phỏng vấn.`
        : data.status === EJobApplicationStatus.OFFERED
          ? `Chúc mừng bạn đã nhận được đề nghị tuyển dụng cho vị trí <strong>${data.jobTitle}</strong> tại <strong>${companyName}</strong>.`
          : `Cảm ơn bạn đã quan tâm và ứng tuyển vị trí <strong>${data.jobTitle}</strong> tại <strong>${companyName}</strong>.`;
    const detailBlock =
      data.status === EJobApplicationStatus.INTERVIEW
        ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-collapse:collapse;">
            <tr>
              <td style="padding:14px 16px;border:1px solid #e5e7eb;background:#f8fafc;font-size:14px;color:#334155;">
                <strong>Thời gian:</strong> ${data.scheduleTime || 'Sẽ được cập nhật sau'}
              </td>
            </tr>
            <tr>
              <td style="padding:14px 16px;border:1px solid #e5e7eb;border-top:none;background:#ffffff;font-size:14px;color:#334155;">
                <strong>Địa điểm:</strong> ${data.scheduleLocation || 'Sẽ được cập nhật sau'}
              </td>
            </tr>
            ${
              data.scheduleLink
                ? `<tr>
              <td style="padding:14px 16px;border:1px solid #e5e7eb;border-top:none;background:#f8fafc;font-size:14px;color:#334155;">
                <strong>Liên kết tham gia:</strong>
                <a href="${data.scheduleLink}" style="color:#185FA5;text-decoration:none;">${data.scheduleLink}</a>
              </td>
            </tr>`
                : ''
            }
          </table>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
            Vui lòng sắp xếp thời gian và chuẩn bị đầy đủ để buổi phỏng vấn diễn ra thuận lợi.
          </p>
        `
        : data.status === EJobApplicationStatus.OFFERED
          ? `
          <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
            Vui lòng kiểm tra các kênh liên hệ từ nhà tuyển dụng để nắm thông tin chi tiết về đề nghị nhận việc và các bước tiếp theo.
          </p>
        `
          : `
          <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
            Sau quá trình xem xét, nhà tuyển dụng hiện chưa thể tiếp tục với hồ sơ này. Hy vọng bạn sẽ sớm tìm được cơ hội phù hợp trong thời gian tới.
          </p>
        `;

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${headerTitle}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,sans-serif;color:#1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #dbe3ef;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 32px;background:#185FA5;color:#ffffff;">
                    <div style="font-size:22px;font-weight:700;line-height:1.4;">${headerTitle}</div>
                    <div style="margin-top:6px;font-size:14px;opacity:0.92;">Hệ thống tuyển dụng FUSE</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
                      ${greeting}
                    </p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#334155;">
                      ${intro}
                    </p>
                    ${detailBlock}
                    <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#64748b;">
                      Trân trọng,<br />
                      <strong>Hệ thống tuyển dụng FUSE</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px;border-top:1px solid #e5e7eb;background:#f8fafc;font-size:12px;line-height:1.7;color:#94a3b8;text-align:center;">
                    Đây là email tự động từ hệ thống. Vui lòng không phản hồi trực tiếp email này.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
