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
        return `Interview invitation - ${data.jobTitle}`;
      case EJobApplicationStatus.OFFERED:
        return `Job offer update - ${data.jobTitle}`;
      default:
        return `Application update - ${data.jobTitle}`;
    }
  }

  private buildHtml(data: IJobApplicationStatusEmailJob): string {
    const greeting = data.fullName ? `<p>Hello ${data.fullName},</p>` : '<p>Hello,</p>';

    if (data.status === EJobApplicationStatus.INTERVIEW) {
      return `
        ${greeting}
        <p>Your application for <strong>${data.jobTitle}</strong>${
          data.companyName ? ` at <strong>${data.companyName}</strong>` : ''
        } has been moved to the interview stage.</p>
        <p>Time: <strong>${data.scheduleTime || 'TBD'}</strong></p>
        <p>Location: <strong>${data.scheduleLocation || 'TBD'}</strong></p>
        ${
          data.scheduleLink
            ? `<p>Meeting link: <a href="${data.scheduleLink}">${data.scheduleLink}</a></p>`
            : ''
        }
        <p>Please prepare accordingly.</p>
      `;
    }

    if (data.status === EJobApplicationStatus.OFFERED) {
      return `
        ${greeting}
        <p>You have received an offer for <strong>${data.jobTitle}</strong>${
          data.companyName ? ` at <strong>${data.companyName}</strong>` : ''
        }.</p>
        <p>Please check your recruiter communication channels for the next steps.</p>
      `;
    }

    return `
      ${greeting}
      <p>Thank you for applying to <strong>${data.jobTitle}</strong>${
        data.companyName ? ` at <strong>${data.companyName}</strong>` : ''
      }.</p>
      <p>After review, the recruiter has decided not to proceed with this application.</p>
    `;
  }
}
