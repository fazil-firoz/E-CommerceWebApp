using System;
using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class CouponCode : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        public decimal MinPurchaseAmount { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }
}
