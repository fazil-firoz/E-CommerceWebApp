using System;
using System.Collections.Generic;

namespace ToyShop.Application.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal ShippingCharge { get; set; }
        public string? CouponCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTimeOffset OrderDate { get; set; }

        // Guest checkout contact info
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }

        // Shipping info (populated when Shipped)
        public string? CourierName { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTimeOffset? ShippedDate { get; set; }

        public CustomerDto? Customer { get; set; }
        public AddressDto? Address { get; set; }
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }
}
