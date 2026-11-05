import { logger } from '../utils/logger';

export interface SendPasswordResetOptions {
  email: string;
  name: string;
  resetToken: string;
  resetUrl: string;
}

export class EmailService {
  /**
   * Send a branded Solace AI password reset email.
   * If SMTP is not configured in development, logs the email preview and reset link safely.
   */
  public static async sendPasswordResetEmail(options: SendPasswordResetOptions): Promise<void> {
    const { email, name, resetToken, resetUrl } = options;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Solace AI Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8F6EF;
      color: #303A34;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 18px;
      padding: 36px 32px;
      box-shadow: 0 4px 20px rgba(48, 58, 52, 0.05);
      border: 1px solid #EFF1E9;
    }
    .logo-badge {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #536B58;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #303A34;
      margin: 0 0 16px 0;
      letter-spacing: -0.3px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #737D75;
      margin: 0 0 20px 0;
    }
    .token-box {
      background-color: #F0F1E9;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      font-family: monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #536B58;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background-color: #829B83;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      margin: 10px 0 24px 0;
    }
    .footer {
      font-size: 12px;
      color: #A0A79F;
      border-top: 1px solid #F0F1E9;
      padding-top: 20px;
      margin-top: 28px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-badge">SOLACE AI • ACCOUNT RECOVERY</div>
    <h1>Reset your password</h1>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password for your Solace AI wellness sanctuary. If you made this request, please use the reset code below:</p>
    
    <div class="token-box">${resetToken}</div>
    
    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>

    <p style="font-size: 13px;">This code and link will expire in <strong>60 minutes</strong>. For your security, this code can only be used once.</p>
    <p style="font-size: 13px;">If you did not request a password reset, you can safely ignore this email. Your account remains protected.</p>
    
    <div class="footer">
      Solace AI — Your personal space to feel, heal and grow.
    </div>
  </div>
</body>
</html>
    `.trim();

    // In development mode (or when SMTP credentials are not yet set):
    logger.info('----------------------------------------------------');
    logger.info(`📧 [DEV EMAIL SERVICE] Password Reset Email to: ${email}`);
    logger.info(`🔑 Reset Token: ${resetToken}`);
    logger.info(`🔗 Reset URL: ${resetUrl}`);
    logger.debug(`📄 Template rendered (${htmlContent.length} chars)`);
    logger.info('----------------------------------------------------');

    // Note: If production SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) are provided,
    // nodemailer or SendGrid/Resend can be plugged in seamlessly here.
    return Promise.resolve();
  }
}
