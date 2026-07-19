using System.Threading;
using System.Threading.Tasks;

namespace ToyShop.Application.Common.Interfaces
{
    public interface IRazorpayService
    {
        Task<string> CreateOrderAsync(decimal amount, string orderNumber, CancellationToken cancellationToken = default);
        bool VerifyPaymentSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature);
    }
}
