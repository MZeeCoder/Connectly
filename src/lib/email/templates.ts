/**
 * Email templates for Connectly application
 */

export interface OTPEmailParams {
    username: string;
    otp: string;
}

/**
 * Generate OTP verification email HTML
 */
export function generateOTPEmail({ username, otp }: OTPEmailParams): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - Connectly</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .otp-container {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .otp-validity {
            font-size: 13px;
            color: #999;
            margin-top: 10px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 Connectly</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px;">Verify Your Account</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello ${username || 'there'}! 👋
            </div>
            
            <div class="message">
                Thank you for signing up for Connectly! We're excited to have you join our community.
                <br><br>
                To complete your registration and activate your account, please use the verification code below:
            </div>

            <!-- OTP Box -->
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">⏱️ This code is valid for the next 10 minutes</div>
            </div>

            <div class="message">
                Simply enter this code on the verification page to complete your registration and start connecting with others!
            </div>

            <!-- Warning -->
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't create an account with Connectly, please ignore this email. Your account will not be activated without the verification code.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>If you're having trouble verifying your account, please contact our support team.</p>
            <p style="margin-top: 15px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Contact Support</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/faq">FAQ</a>
            </p>
            
            <div class="social-links">
                <a href="#">Twitter</a> | 
                <a href="#">Facebook</a> | 
                <a href="#">Instagram</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} Connectly. All rights reserved.
                <br>
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate plain text version of OTP email (for email clients that don't support HTML)
 */
export function generateOTPEmailText({ username, otp }: OTPEmailParams): string {
    return `
Hello ${username || 'there'}!

Thank you for signing up for Connectly! We're excited to have you join our community.

Your Verification Code: ${otp}

This code is valid for the next 10 minutes.

Simply enter this code on the verification page to complete your registration and start connecting with others!

SECURITY NOTICE: If you didn't create an account with Connectly, please ignore this email. Your account will not be activated without the verification code.

Need help? Contact our support team at ${process.env.NEXT_PUBLIC_APP_URL}/support

© ${new Date().getFullYear()} Connectly. All rights reserved.
This is an automated email. Please do not reply to this message.
    `.trim();
}
