import sanitizeHtml from 'sanitize-html';
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
    const companyName = data.name || 'Nhà tuyển dụng';

    switch (data.status) {
      case EJobApplicationStatus.INTERVIEW:
        return `${companyName} - Thư mời phỏng vấn - ${data.jobTitle}`;
      case EJobApplicationStatus.ACCEPTED:
        return `${companyName} - Thông báo trúng tuyển - ${data.jobTitle}`;
      case EJobApplicationStatus.REJECTED:
        return `${companyName} - Thông báo kết quả ứng tuyển - ${data.jobTitle}`;
      default:
        return `${companyName} - Cập nhật hồ sơ ứng tuyển - ${data.jobTitle}`;
    }
  }

  private buildHtml(data: IJobApplicationStatusEmailJob): string {
    const greeting = data.fullName
      ? `Chào ${this.escapeHtml(data.fullName)},`
      : 'Chào bạn,';

    const companyName = this.escapeHtml(data.name || 'quý công ty');
    const jobTitle = this.escapeHtml(data.jobTitle);

    const headerTitle =
      data.status === EJobApplicationStatus.INTERVIEW
        ? 'Thư mời phỏng vấn'
        : data.status === EJobApplicationStatus.ACCEPTED
          ? 'Thông báo trúng tuyển'
          : data.status === EJobApplicationStatus.REJECTED
            ? 'Thông báo kết quả ứng tuyển'
            : 'Cập nhật hồ sơ ứng tuyển';

    const statusLabel =
      data.status === EJobApplicationStatus.INTERVIEW
        ? 'Hồ sơ đã chuyển sang vòng phỏng vấn'
        : data.status === EJobApplicationStatus.ACCEPTED
          ? 'Hồ sơ đã được chấp nhận'
          : data.status === EJobApplicationStatus.REJECTED
            ? 'Hồ sơ chưa phù hợp'
            : 'Hồ sơ có cập nhật mới';

    const statusColor =
      data.status === EJobApplicationStatus.INTERVIEW
        ? '#185FA5'
        : data.status === EJobApplicationStatus.ACCEPTED
          ? '#15803d'
          : data.status === EJobApplicationStatus.REJECTED
            ? '#be123c'
            : '#475569';

    const statusBg =
      data.status === EJobApplicationStatus.INTERVIEW
        ? '#eff6ff'
        : data.status === EJobApplicationStatus.ACCEPTED
          ? '#ecfdf5'
          : data.status === EJobApplicationStatus.REJECTED
            ? '#fff1f2'
            : '#f1f5f9';

    const intro =
      data.status === EJobApplicationStatus.INTERVIEW
        ? `Cảm ơn bạn đã quan tâm và ứng tuyển vị trí <strong>${jobTitle}</strong> tại <strong>${companyName}</strong>. Sau quá trình xem xét hồ sơ, <strong>${companyName}</strong> mong muốn được trao đổi thêm với bạn trong buổi phỏng vấn sắp tới.`
        : data.status === EJobApplicationStatus.ACCEPTED
          ? `Chúc mừng bạn! <strong>${companyName}</strong> xác nhận hồ sơ ứng tuyển vị trí <strong>${jobTitle}</strong> của bạn đã được chấp nhận. Vui lòng xem kỹ các thông tin chuẩn bị nhận việc bên dưới.`
          : data.status === EJobApplicationStatus.REJECTED
            ? `Cảm ơn bạn đã dành thời gian quan tâm và ứng tuyển vị trí <strong>${jobTitle}</strong> tại <strong>${companyName}</strong>. Sau quá trình xem xét, <strong>${companyName}</strong> xin gửi đến bạn cập nhật mới nhất về kết quả hồ sơ.`
            : `Cảm ơn bạn đã quan tâm và ứng tuyển vị trí <strong>${jobTitle}</strong> tại <strong>${companyName}</strong>. Hồ sơ của bạn đã có cập nhật trạng thái mới từ <strong>${companyName}</strong>.`;

    const detailBlock =
      data.status === EJobApplicationStatus.INTERVIEW
        ? `
        <div style="margin:24px 0 0;padding:22px;border:1px solid #dbeafe;border-radius:16px;background:#f8fbff;">
          <div style="margin:0 0 16px;font-size:16px;font-weight:700;line-height:1.5;color:#185FA5;">
            Thông tin phỏng vấn
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${
              data.interviewType
                ? `<tr>
                    <td style="padding:12px 0;border-top:1px solid #e5e7eb;width:130px;vertical-align:top;font-size:14px;line-height:1.6;color:#64748b;">
                      <strong>Hình thức</strong>
                    </td>
                    <td style="padding:12px 0;border-top:1px solid #e5e7eb;vertical-align:top;font-size:14px;line-height:1.6;color:#1e293b;">
                      ${data.interviewType === 'online' ? 'Phỏng vấn trực tuyến' : 'Phỏng vấn trực tiếp'}
                    </td>
                  </tr>`
                : ''
            }

            <tr>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;width:130px;vertical-align:top;font-size:14px;line-height:1.6;color:#64748b;">
                <strong>Thời gian</strong>
              </td>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;vertical-align:top;font-size:14px;line-height:1.6;color:#1e293b;">
                ${this.escapeHtml(String(data.scheduleTime || 'Sẽ được cập nhật sau'))}
              </td>
            </tr>

            <tr>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;width:130px;vertical-align:top;font-size:14px;line-height:1.6;color:#64748b;">
                <strong>Địa điểm</strong>
              </td>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;vertical-align:top;font-size:14px;line-height:1.6;color:#1e293b;">
                ${this.escapeHtml(data.scheduleLocation || 'Sẽ được cập nhật sau')}
              </td>
            </tr>

            ${
              data.scheduleLink
                ? `<tr>
                    <td style="padding:12px 0;border-top:1px solid #e5e7eb;width:130px;vertical-align:top;font-size:14px;line-height:1.6;color:#64748b;">
                      <strong>Liên kết</strong>
                    </td>
                    <td style="padding:12px 0;border-top:1px solid #e5e7eb;vertical-align:top;font-size:14px;line-height:1.6;color:#1e293b;">
                      <a href="${this.escapeHtml(data.scheduleLink)}" style="display:inline-block;color:#185FA5;text-decoration:none;font-weight:700;">
                        Tham gia phỏng vấn
                      </a>
                    </td>
                  </tr>`
                : ''
            }
          </table>
        </div>

        ${
          data.interviewNotes
            ? `<div style="margin:22px 0 0;padding:20px;border:1px solid #dbeafe;border-radius:16px;background:#ffffff;">
                <div style="margin:0 0 12px;font-size:15px;font-weight:700;line-height:1.5;color:#185FA5;">
                  Ghi chú từ ${companyName}
                </div>

                <div class="rich-content" style="margin:0;font-size:14px;line-height:1.85;color:#475569;">
                  ${this.sanitizeRichTextHtml(data.interviewNotes)}
                </div>
              </div>`
            : `<p style="margin:20px 0 0;font-size:14px;line-height:1.8;color:#475569;">
                Vui lòng sắp xếp thời gian và chuẩn bị đầy đủ để buổi phỏng vấn diễn ra thuận lợi.
              </p>`
        }
      `
        : data.status === EJobApplicationStatus.ACCEPTED
          ? `
          <div style="margin:24px 0 0;padding:22px;border:1px solid #bbf7d0;border-radius:16px;background:#ecfdf5;">
            <div style="margin:0 0 10px;font-size:17px;font-weight:700;line-height:1.5;color:#15803d;">
              Chúc mừng bạn đã trúng tuyển!
            </div>

            <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
              ${companyName} sẽ tiếp tục liên hệ với bạn để trao đổi các thông tin liên quan đến quy trình nhận việc,
              thời gian bắt đầu và các bước chuẩn bị cần thiết.
            </p>
          </div>

          ${
            data.onboardingNotes
              ? `<div style="margin:22px 0 0;padding:20px;border:1px solid #bbf7d0;border-radius:16px;background:#ffffff;">
                  <div style="margin:0 0 12px;font-size:15px;font-weight:700;line-height:1.5;color:#15803d;">
                    Yêu cầu chuẩn bị nhận việc
                  </div>

                  <div class="rich-content" style="margin:0;font-size:14px;line-height:1.85;color:#475569;">
                    ${this.sanitizeRichTextHtml(data.onboardingNotes)}
                  </div>
                </div>`
              : `<p style="margin:20px 0 0;font-size:14px;line-height:1.8;color:#475569;">
                  Vui lòng theo dõi email và điện thoại để nhận thêm thông tin nhận việc chi tiết từ ${companyName}.
                </p>`
          }
        `
          : data.status === EJobApplicationStatus.REJECTED
            ? `
            ${
              data.rejectionReason
                ? `<div style="margin:24px 0 0;padding:20px;border:1px solid #fecdd3;border-radius:16px;background:#fff7f8;">
                    <div style="margin:0 0 12px;font-size:15px;font-weight:700;line-height:1.5;color:#be123c;">
                      Phản hồi từ ${companyName}
                    </div>

                    <div class="rich-content" style="margin:0;font-size:14px;line-height:1.85;color:#475569;">
                      ${this.sanitizeRichTextHtml(data.rejectionReason)}
                    </div>
                  </div>`
                : `<div style="margin:24px 0 0;padding:20px;border:1px solid #fecdd3;border-radius:16px;background:#fff7f8;">
                    <div style="margin:0 0 10px;font-size:15px;font-weight:700;line-height:1.5;color:#be123c;">
                      Kết quả ứng tuyển
                    </div>

                    <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
                      Hiện tại ${companyName} chưa thể tiếp tục với hồ sơ này. ${companyName} ghi nhận sự quan tâm của bạn và hy vọng sẽ có cơ hội phù hợp hơn trong thời gian tới.
                    </p>
                  </div>`
            }

            <p style="margin:20px 0 0;font-size:14px;line-height:1.8;color:#475569;">
              Cảm ơn bạn đã dành thời gian cho quá trình ứng tuyển. Chúc bạn sớm tìm được cơ hội phù hợp hơn trong thời gian tới.
            </p>
          `
            : `
            <div style="margin:24px 0 0;padding:20px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc;">
              <div style="margin:0 0 10px;font-size:15px;font-weight:700;line-height:1.5;color:#334155;">
                Hồ sơ của bạn đã được cập nhật
              </div>

              <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
                Vui lòng theo dõi email hoặc truy cập hệ thống để xem thêm thông tin chi tiết về trạng thái ứng tuyển.
              </p>
            </div>
          `;

    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${headerTitle}</title>

      <style>
        .rich-content p {
          margin: 0 0 10px !important;
          font-size: 14px !important;
          line-height: 1.85 !important;
          color: #475569 !important;
        }

        .rich-content ul,
        .rich-content ol {
          margin: 8px 0 12px 22px !important;
          padding: 0 !important;
          color: #475569 !important;
        }

        .rich-content li {
          margin: 4px 0 !important;
          font-size: 14px !important;
          line-height: 1.75 !important;
          color: #475569 !important;
        }

        .rich-content strong,
        .rich-content b {
          font-weight: 700 !important;
          color: #334155 !important;
        }

        .rich-content em,
        .rich-content i {
          font-style: italic !important;
        }

        .rich-content u {
          text-decoration: underline !important;
        }

        .rich-content s {
          text-decoration: line-through !important;
        }

        .rich-content a {
          color: #185FA5 !important;
          text-decoration: none !important;
          font-weight: 600 !important;
        }

        .rich-content blockquote {
          margin: 12px 0 !important;
          padding: 10px 14px !important;
          border-left: 3px solid #cbd5e1 !important;
          background: #f8fafc !important;
          color: #475569 !important;
        }

        .rich-content h1,
        .rich-content h2,
        .rich-content h3 {
          margin: 0 0 10px !important;
          line-height: 1.5 !important;
          color: #1e293b !important;
        }

        .rich-content h1 {
          font-size: 18px !important;
        }

        .rich-content h2 {
          font-size: 17px !important;
        }

        .rich-content h3 {
          font-size: 16px !important;
        }

        .rich-content .ql-align-center {
          text-align: center !important;
        }

        .rich-content .ql-align-right {
          text-align: right !important;
        }

        .rich-content .ql-align-justify {
          text-align: justify !important;
        }

        .rich-content .ql-indent-1 {
          padding-left: 24px !important;
        }

        .rich-content .ql-indent-2 {
          padding-left: 48px !important;
        }

        .rich-content .ql-indent-3 {
          padding-left: 72px !important;
        }
      </style>
    </head>

    <body style="margin:0;padding:0;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f8;padding:36px 16px;">
        <tr>
          <td align="center">
            <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #dbe3ef;border-radius:18px;overflow:hidden;box-shadow:0 14px 36px rgba(15,23,42,0.10);">
              
              <tr>
                <td style="padding:30px 34px;background:#185FA5;color:#ffffff;">
                  <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.86;font-weight:700;">
                    ${companyName}
                  </div>

                  <div style="margin-top:10px;font-size:24px;font-weight:700;line-height:1.35;">
                    ${headerTitle}
                  </div>

                  <div style="margin-top:10px;font-size:14px;line-height:1.7;opacity:0.92;">
                    Thông báo được gửi qua hệ thống quản lý tuyển dụng Fuse
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 34px 30px;">
                  <span style="display:inline-block;padding:7px 12px;border-radius:999px;background:${statusBg};color:${statusColor};font-size:12px;font-weight:700;letter-spacing:0.02em;">
                    ${statusLabel}
                  </span>

                  <p style="margin:22px 0 14px;font-size:15px;line-height:1.8;color:#334155;">
                    ${greeting}
                  </p>

                  <p style="margin:0 0 22px;font-size:15px;line-height:1.85;color:#334155;">
                    ${intro}
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;">
                    <tr>
                      <td style="padding:18px 20px;border:1px solid #e5e7eb;border-radius:14px;background:#f8fafc;">
                        <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:700;">
                          Vị trí ứng tuyển
                        </div>

                        <div style="margin-top:8px;font-size:17px;line-height:1.5;color:#0f172a;font-weight:700;">
                          ${jobTitle}
                        </div>

                        <div style="margin-top:4px;font-size:14px;line-height:1.6;color:#64748b;">
                          ${companyName}
                        </div>
                      </td>
                    </tr>
                  </table>

                  ${detailBlock}

                  <p style="margin:28px 0 0;font-size:14px;line-height:1.8;color:#64748b;">
                    Trân trọng,<br />
                    <strong style="color:#334155;">${companyName}</strong>
                  </p>
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

  private sanitizeRichTextHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'ul',
        'ol',
        'li',
        'blockquote',
        'a',
        'span',
        'h1',
        'h2',
        'h3',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        span: ['style', 'class'],
        p: ['style', 'class'],
        h1: ['style', 'class'],
        h2: ['style', 'class'],
        h3: ['style', 'class'],
        ul: ['style', 'class'],
        ol: ['style', 'class'],
        li: ['style', 'class'],
        blockquote: ['style', 'class'],
      },
      allowedStyles: {
        '*': {
          color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
          'background-color': [
            /^#[0-9a-fA-F]{3,6}$/,
            /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/,
          ],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        },
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          target: '_blank',
          rel: 'noopener noreferrer',
          style: 'color:#185FA5;text-decoration:none;font-weight:600;',
        }),
      },
    }).trim();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
