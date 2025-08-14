exports.generateOTPEmailTemplate = (name, verificationLink, expireMinutes) => {
    // Generate random 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000);
    
    // Calculate expiration time
    const now = new Date();
    const expireTime = new Date(now.getTime() + expireMinutes * 60000);
    const formattedExpireTime = expireTime.toLocaleString();
    
    // Create HTML email template
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .otp-display {
            background-color: #f5f5f5;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .verify-button {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
        .warning {
            color: #d32f2f;
            font-weight: bold;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Your One-Time Password (OTP)</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>Your one-time password for verification is:</p>
        
        <div class="otp-display">${otp}</div>
        
        <p>This OTP is valid until <strong>${formattedExpireTime}</strong> (${expireMinutes} minutes from now).</p>
        
        <div class="text-center">
            <a href="${verificationLink}" class="verify-button">Verify Account</a>
        </div>
        
        <p>Or copy and paste this link in your browser: <br/>${verificationLink}</p>
        
        <p class="warning">Please do not share this OTP with anyone for security reasons.</p>
        
        <p>If you didn't request this OTP, please ignore this email or contact support.</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;
    
    return {
        otp: otp.toString(),
        html: htmlTemplate
    };
}

// Example usage:
// const result = generateOTPEmailTemplate(
//     "John Doe", 
//     "https://yourapp.com/verify?token=abc123", 
//     15
// );
// console.log(result.otp); // The generated OTP
// console.log(result.html); // The HTML email template