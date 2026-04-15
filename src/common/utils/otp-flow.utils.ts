import { randomInt } from 'crypto';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export async function handleOtpFlow(
  email: string,
  payload: any,
  redis: RedisAdapter,
  mailService: MailService,
  OTP_TTL: number,
) {
  await redis.setTempProfile(email, payload, OTP_TTL);
  const otp = randomInt(100000, 1000000).toString();
  await redis.setOtp(email, otp, OTP_TTL);
  await mailService.sendOtp(email, otp);
}
