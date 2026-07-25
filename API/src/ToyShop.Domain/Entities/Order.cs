using ToyShop.Domain.Common;
using ToyShop.Domain.Enums;
using System;
using System.Collections.Generic;

namespace ToyShop.Domain.Entities
{
    public class Order : BaseEntity
    {
        public string OrderNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int AddressId { get; set; }
        public DateTimeOffset OrderDate { get; set; } = DateTimeOffset.UtcNow;
        public decimal TotalAmount { get; set; }
        public decimal ShippingCharge { get; set; } = 0;
        public string? CouponCode { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        // Guest checkout contact info (stored directly on order for tracking)
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }

        // Shipping tracking info (populated when order is marked as Shipped)
        public string? CourierName { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTimeOffset? ShippedDate { get; set; }

        // Future readiness: notification preferences (not implemented yet)
        // public bool NotifyEmail { get; set; } = false;
        // public bool NotifyWhatsApp { get; set; } = false;
        // public bool NotifySms { get; set; } = false;

        public Customer? Customer { get; set; }
        public Address? Address { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
