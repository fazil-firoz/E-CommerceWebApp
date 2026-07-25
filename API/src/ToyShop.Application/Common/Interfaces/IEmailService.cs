using System.Threading;
using System.Threading.Tasks;

namespace ToyShop.Application.Common.Interfaces
{
    public interface IEmailService
    {
        /// <summary>Sends an OTP code to the given email address.</summary>
        Task SendOtpEmailAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default);

        /// <summary>Sends a contact form message to the store admin email.</summary>
        Task SendContactMessageAsync(string name, string phone, string email, string subject, string message, CancellationToken cancellationToken = default);

        /// <summary>Sends a shipment confirmation email with courier and tracking details to the customer.</summary>
        Task SendShipmentNotificationAsync(string toEmail, string customerName, string orderNumber, string courierName, string trackingNumber, decimal totalAmount, CancellationToken cancellationToken = default);
    }
}
