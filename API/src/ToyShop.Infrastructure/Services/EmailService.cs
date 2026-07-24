using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MimeKit;
using System;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Domain.Entities;

namespace ToyShop.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;

        public EmailService(IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
        }

        private async Task<string> GetShopNameAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var shopRepo = scope.ServiceProvider.GetService<IRepository<Shop>>();
                if (shopRepo != null)
                {
                    var shop = await shopRepo.Query().FirstOrDefaultAsync(cancellationToken);
                    if (shop != null && !string.IsNullOrWhiteSpace(shop.ShopName))
                    {
                        return shop.ShopName.Trim();
                    }
                }
            }
            catch
            {
                // Fallback if DB query fails
            }

            var fromName = _configuration["Email:FromName"];
            if (!string.IsNullOrWhiteSpace(fromName) && fromName != "ToyVerse Shop" && fromName != "OTP Test")
            {
                return fromName.Trim();
            }

            return "Store";
        }

        public async Task SendOtpEmailAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default)
        {
            var shopName = await GetShopNameAsync(cancellationToken);
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"] ?? "";
            var smtpPass = _configuration["Email:SmtpPass"] ?? "";
            var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(shopName, fromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = $"Your {shopName} OTP: {otpCode}";

            var body = new BodyBuilder
            {
                HtmlBody = BuildOtpEmailHtml(otpCode, toEmail, shopName),
                TextBody = $"Your {shopName} one-time password is: {otpCode}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email."
            };
            message.Body = body.ToMessageBody();

            using var smtp = new SmtpClient();
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await smtp.AuthenticateAsync(smtpUser, smtpPass, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }

        public async Task SendContactMessageAsync(string name, string phone, string email, string subject, string messageContent, CancellationToken cancellationToken = default)
        {
            var shopName = await GetShopNameAsync(cancellationToken);
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"] ?? "";
            var smtpPass = _configuration["Email:SmtpPass"] ?? "";
            var companyEmail = _configuration["Email:FromEmail"] ?? smtpUser;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress($"{name} ({shopName} Web Inquiry)", companyEmail));
            message.To.Add(MailboxAddress.Parse(companyEmail));
            if (!string.IsNullOrWhiteSpace(email) && email.Contains("@"))
            {
                message.ReplyTo.Add(new MailboxAddress(name, email));
            }
            message.Subject = $"📩 [{shopName}] New Customer Inquiry: {(string.IsNullOrWhiteSpace(subject) ? "Website Contact Form" : subject)} from {name}";

            var body = new BodyBuilder
            {
                HtmlBody = BuildContactEmailHtml(name, phone, email, subject, messageContent, shopName),
                TextBody = $"New Customer Inquiry for {shopName}\n\nName: {name}\nPhone: {phone}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{messageContent}"
            };
            message.Body = body.ToMessageBody();

            using var smtp = new SmtpClient();
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await smtp.AuthenticateAsync(smtpUser, smtpPass, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }

        private static string BuildOtpEmailHtml(string otp, string email, string shopName)
        {
            var digits = string.Join("</td><td style=\"width:44px;height:52px;background:#fdf2f8;border:2px solid #ec4899;border-radius:10px;text-align:center;vertical-align:middle;font-size:26px;font-weight:800;color:#ec4899;font-family:monospace;\">", otp.ToCharArray());

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;background:#f5f7fa;font-family:Inter,Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f5f7fa;padding:40px 20px;"">
    <tr><td align=""center"">
      <table width=""480"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">
        <tr>
          <td style=""background:linear-gradient(135deg,#ec4899,#f472b6);padding:32px;text-align:center;"">
            <div style=""font-size:36px;margin-bottom:8px;"">💖</div>
            <div style=""color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;"">{shopName}</div>
            <div style=""color:rgba(255,255,255,0.9);font-size:13px;margin-top:4px;"">Your one-time sign-in code</div>
          </td>
        </tr>
        <tr>
          <td style=""padding:40px 40px 32px;"">
            <p style=""margin:0 0 8px;font-size:15px;color:#595959;"">Hi there 👋</p>
            <p style=""margin:0 0 28px;font-size:15px;color:#595959;line-height:1.6;"">
              Use the code below to sign in to your <strong>{shopName}</strong> account. 
              This code is valid for <strong>10 minutes</strong>.
            </p>
            <table cellpadding=""0"" cellspacing=""8"" align=""center"" style=""margin:0 auto 28px;"">
              <tr>
                <td style=""width:44px;height:52px;background:#fdf2f8;border:2px solid #ec4899;border-radius:10px;text-align:center;vertical-align:middle;font-size:26px;font-weight:800;color:#ec4899;font-family:monospace;"">{digits}</td>
              </tr>
            </table>
            <div style=""background:#fffbe6;border:1px solid #fadc14;border-radius:10px;padding:14px 18px;margin-bottom:24px;"">
              <p style=""margin:0;font-size:13px;color:#614700;"">
                ⚠️ <strong>Never share this code</strong> with anyone. {shopName} staff will never ask for your OTP.
              </p>
            </div>
            <p style=""margin:0;font-size:13px;color:#8c8c8c;line-height:1.6;"">
              If you didn't request this code, you can safely ignore this email.
              Someone may have entered <strong>{email}</strong> by mistake.
            </p>
          </td>
        </tr>
        <tr>
          <td style=""background:#f9f9f9;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;"">
            <p style=""margin:0;font-size:12px;color:#bfbfbf;"">
              {shopName} Support Desk · Automated Security Notification
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
        }

        private static string BuildContactEmailHtml(string name, string phone, string email, string subject, string message, string shopName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;background:#fdf2f8;font-family:Inter,Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#fdf2f8;padding:40px 20px;"">
    <tr><td align=""center"">
      <table width=""540"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(236,72,153,0.1);border:1px solid #fce7f3;"">
        <tr>
          <td style=""background:linear-gradient(135deg,#ec4899,#be185d);padding:32px;text-align:center;"">
            <div style=""font-size:36px;margin-bottom:6px;"">📩</div>
            <div style=""color:#fff;font-size:22px;font-weight:800;"">New Message for {shopName}</div>
            <div style=""color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px;"">Received from Customer Inquiry Form</div>
          </td>
        </tr>
        <tr>
          <td style=""padding:32px 36px;"">
            
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:24px;border-collapse:separate;border-spacing:0 10px;"">
              <tr>
                <td width=""120"" style=""font-size:13px;font-weight:700;color:#6b7280;"">Customer Name:</td>
                <td style=""font-size:15px;font-weight:600;color:#1f1f1f;"">{name}</td>
              </tr>
              <tr>
                <td style=""font-size:13px;font-weight:700;color:#6b7280;"">Email Address:</td>
                <td style=""font-size:15px;font-weight:600;color:#ec4899;""><a href=""mailto:{email}"" style=""color:#ec4899;"">{email}</a></td>
              </tr>
              <tr>
                <td style=""font-size:13px;font-weight:700;color:#6b7280;"">Phone Number:</td>
                <td style=""font-size:15px;font-weight:600;color:#1f1f1f;"">{phone}</td>
              </tr>
              <tr>
                <td style=""font-size:13px;font-weight:700;color:#6b7280;"">Subject:</td>
                <td style=""font-size:15px;font-weight:600;color:#1f1f1f;"">{subject}</td>
              </tr>
            </table>

            <div style=""background:#fdf2f8;border-left:4px solid #ec4899;border-radius:8px;padding:18px 20px;margin-bottom:24px;"">
              <div style=""font-size:12px;font-weight:800;color:#be185d;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;"">Customer Message:</div>
              <div style=""font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;"">{message}</div>
            </div>

            <p style=""margin:0;font-size:12px;color:#9ca3af;text-align:center;"">
              💡 <strong>Tip:</strong> Click ""Reply"" in your email client to directly reply to {name} ({email}).
            </p>
          </td>
        </tr>
        <tr>
          <td style=""background:#f9fafb;border-top:1px solid #fce7f3;padding:16px 36px;text-align:center;"">
            <p style=""margin:0;font-size:12px;color:#9ca3af;"">{shopName} Customer Desk Notification System</p>
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
