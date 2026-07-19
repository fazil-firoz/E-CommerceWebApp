using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;

namespace ToyShop.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default)
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"] ?? "";
            var smtpPass = _configuration["Email:SmtpPass"] ?? "";
            var fromName = _configuration["Email:FromName"] ?? "ToyVerse Shop";
            var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = $"Your ToyVerse OTP: {otpCode}";

            var body = new BodyBuilder
            {
                HtmlBody = BuildOtpEmailHtml(otpCode, toEmail),
                TextBody = $"Your ToyVerse one-time password is: {otpCode}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email."
            };
            message.Body = body.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await smtp.AuthenticateAsync(smtpUser, smtpPass, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }

        private static string BuildOtpEmailHtml(string otp, string email)
        {
            // Split OTP into individual digits for styled display
            var digits = string.Join("</td><td style='width:44px;height:52px;background:#f0f7ff;border:2px solid #1677ff;border-radius:10px;text-align:center;vertical-align:middle;font-size:26px;font-weight:800;color:#1677ff;font-family:monospace;'>", otp.ToCharArray());

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='margin:0;padding:0;background:#f5f7fa;font-family:Inter,Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f5f7fa;padding:40px 20px;'>
    <tr><td align='center'>
      <table width='480' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>
        
        <!-- Header -->
        <tr>
          <td style='background:linear-gradient(135deg,#1677ff,#4096ff);padding:32px;text-align:center;'>
            <div style='font-size:36px;margin-bottom:8px;'>🧸</div>
            <div style='color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;'>ToyVerse</div>
            <div style='color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;'>Your one-time sign-in code</div>
          </td>
        </tr>
        
        <!-- Body -->
        <tr>
          <td style='padding:40px 40px 32px;'>
            <p style='margin:0 0 8px;font-size:15px;color:#595959;'>Hi there 👋</p>
            <p style='margin:0 0 28px;font-size:15px;color:#595959;line-height:1.6;'>
              Use the code below to sign in to your ToyVerse account. 
              This code is valid for <strong>10 minutes</strong>.
            </p>
            
            <!-- OTP Digits -->
            <table cellpadding='0' cellspacing='8' align='center' style='margin:0 auto 28px;'>
              <tr>
                <td style='width:44px;height:52px;background:#f0f7ff;border:2px solid #1677ff;border-radius:10px;text-align:center;vertical-align:middle;font-size:26px;font-weight:800;color:#1677ff;font-family:monospace;'>{digits}</td>
              </tr>
            </table>
            
            <div style='background:#fffbe6;border:1px solid #fadc14;border-radius:10px;padding:14px 18px;margin-bottom:24px;'>
              <p style='margin:0;font-size:13px;color:#614700;'>
                ⚠️ <strong>Never share this code</strong> with anyone. ToyVerse staff will never ask for your OTP.
              </p>
            </div>
            
            <p style='margin:0;font-size:13px;color:#8c8c8c;line-height:1.6;'>
              If you didn't request this code, you can safely ignore this email.
              Someone may have entered <strong>{email}</strong> by mistake.
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style='background:#f9f9f9;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;'>
            <p style='margin:0;font-size:12px;color:#bfbfbf;'>
              ToyVerse Shop · Your portal to imagination and joy<br/>
              This is an automated message, please do not reply.
            </p>
          </td>
        </tr>
        
      </table>
    </td></tr>
  </table>
</body>
</html>";
        }
    }
}
