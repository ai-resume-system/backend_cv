import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');
    const appName = this.configService.get<string>('MAIL_FROM_NAME');
    const supportEmail = this.configService.get<string>('SMTP_USER');
    const year = new Date().getFullYear();

    const mailOptions = {
      from: `${fromName} <${fromAddress}>`,
      to: email,
      subject: `[${appName}] Mã xác thực OTP của bạn`,
      html: `
       <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Mã xác thực OTP</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

                <!-- Header -->
                <tr>
                  <td style="background:#185FA5;padding:28px 40px;text-align:center;">
                    <span style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">${appName}</span>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a1a;">
                      Xác thực tài khoản của bạn
                    </h2>
                    <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;">
                      Chúng tôi nhận được yêu cầu xác thực từ tài khoản của bạn.
                      Sử dụng mã OTP dưới đây để tiếp tục.
                    </p>

                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="background:#f0f4f9;border:1px solid #d0dce8;border-radius:10px;padding:24px;text-align:center;">
                          <p style="margin:0 0 8px;font-size:12px;color:#888;letter-spacing:1.5px;text-transform:uppercase;">
                            Mã xác thực OTP
                          </p>
                          <p style="margin:0;font-size:38px;font-weight:bold;letter-spacing:12px;color:#185FA5;font-family:monospace;">
                            ${otp}
                          </p>
                          <p style="margin:12px 0 0;font-size:13px;color:#999;">
                            Hiệu lực trong <strong style="color:#555;">5 phút</strong>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Warning -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#fff8ec;border-left:3px solid #f0a500;border-radius:4px;padding:14px 16px;">
                          <p style="margin:0;font-size:13px;color:#7a5200;line-height:1.6;">
                            <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã này với bất kỳ ai,
                            kể cả nhân viên hỗ trợ của chúng tôi.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:14px;color:#888;line-height:1.7;">
                      Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này
                      hoặc <a href="mailto:${supportEmail}" style="color:#185FA5;text-decoration:none;">liên hệ hỗ trợ</a>
                      nếu bạn lo ngại về bảo mật tài khoản.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="border-top:1px solid #eeeeee;padding:20px 40px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#aaa;">
                      © ${year} ${appName}. Đây là email tự động, vui lòng không phản hồi.
                    </p>
                    <p style="margin:0;font-size:12px;color:#aaa;">
                      Nếu cần hỗ trợ, liên hệ
                      <a href="mailto:${supportEmail}" style="color:#185FA5;text-decoration:none;">${supportEmail}</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}`, error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const fromName =
      this.configService.get<string>('MAIL_FROM_NAME') || 'System';
    const fromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') ||
      'noreply@system.com';

    const mailOptions = {
      from: `${fromName} <${fromAddress}>`,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
