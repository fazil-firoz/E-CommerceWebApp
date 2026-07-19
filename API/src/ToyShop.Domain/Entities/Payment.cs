using ToyShop.Domain.Common;
using ToyShop.Domain.Enums;

namespace ToyShop.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public int OrderId { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentGateway { get; set; } = "Razorpay";
        public decimal Amount { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public Order? Order { get; set; }
    }
}
