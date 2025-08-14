exports.generatePasswordResetEmail = (username, resetLink, expireMinutes) => {
    // Calculate expiration time
    const now = new Date();
    const expireTime = new Date(now.getTime() + expireMinutes * 60000);
    const formattedExpireTime = expireTime.toLocaleString();

    // Create HTML email template
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 1px solid #eeeeee;
            padding-bottom: 15px;
        }
        .header h2 {
            color: #2c3e50;
            margin: 0;
        }
        .reset-button {
            display: inline-block;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s;
        }
        .reset-button:hover {
            background-color: #2980b9;
        }
        .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
            border-top: 1px solid #eeeeee;
            padding-top: 15px;
        }
        .warning {
            color: #e74c3c;
            font-weight: bold;
        }
        .text-center {
            text-align: center;
        }
        .link-text {
            word-break: break-all;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Password Reset Request</h2>
        </div>
        
        <p>Hello <strong>${username}</strong>,</p>
        
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        
        <div class="text-center">
            <a href="${resetLink}" class="reset-button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <div class="link-text">${resetLink}</div>
        
        <p>This password reset link will expire on <strong>${formattedExpireTime}</strong> (${expireMinutes} minutes from now).</p>
        
        <p class="warning">If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
        
        <p>For security reasons, we recommend that you don't share this link with anyone.</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    return htmlTemplate;
}

// Example usage:
// const resetEmail = generatePasswordResetEmail(
//     "john_doe",
//     "https://yourapp.com/reset-password?token=abc123xyz",
//     30 // expires in 30 minutes
// );
// console.log(resetEmail); // The HTML email template