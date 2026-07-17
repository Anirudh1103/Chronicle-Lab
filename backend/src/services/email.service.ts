import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private static getResendConfig() {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Chronicle Lab <onboarding@resend.dev>';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return { apiKey, fromEmail, frontendUrl };
  }

  static async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const { apiKey, fromEmail, frontendUrl } = this.getResendConfig();

    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured in .env. Email sending skipped.');
      console.log(`[DEV MODE] Verification Link for ${email}: ${frontendUrl}/newsletter/verify?token=${token}`);
      return true; // Return true in dev/test if key is not configured, to let testing proceed smoothly
    }

    const verificationUrl = `${frontendUrl}/newsletter/verify?token=${token}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm your subscription</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #030712;
      color: #f3f4f6;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0b0f19;
      border: 1px solid #1f2937;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.05em;
      color: #ffffff;
      text-decoration: none;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 30px;
    }
    .logo span {
      color: #3b82f6;
      opacity: 0.8;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.025em;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #9ca3af;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      margin-top: 32px;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background-color: #3b82f6;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 16px 32px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #1f2937;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <a href="${frontendUrl}" class="logo">CHRONICLE<span>.LAB</span></a>
      <h1>Confirm your subscription</h1>
      <p>You're one step away from joining Chronicle Lab.</p>
      <p>Confirm your email to receive new stories and deep dives into History, Technology, and Cyber Security.</p>
      <div class="btn-container">
        <a href="${verificationUrl}" class="btn">Confirm Subscription</a>
      </div>
      <p style="font-size: 14px;">If you didn't request this subscription, you can safely ignore this email.</p>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Chronicle Lab. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: 'Confirm your subscription to Chronicle Lab',
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send verification email via Resend:', response.status, errorData);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending verification email:', err);
      return false;
    }
  }
}
