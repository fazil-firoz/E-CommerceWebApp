using System.Threading;
using System.Threading.Tasks;

namespace ToyShop.Application.Common.Interfaces
{
    public interface IEmailService
    {
        /// <summary>Sends an OTP code to the given email address.</summary>
        Task SendOtpEmailAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default);
    }
}
