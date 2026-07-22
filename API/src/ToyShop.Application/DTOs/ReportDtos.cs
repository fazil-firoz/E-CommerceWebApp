using System;
using System.Collections.Generic;

namespace ToyShop.Application.DTOs
{
    public class StockReportItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal Mrp { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public decimal TotalStockValue { get; set; }
        public string StockStatus { get; set; } = string.Empty; // InStock, LowStock, OutOfStock
        public string PrimaryImageUrl { get; set; } = string.Empty;
    }

    public class StockReportSummaryDto
    {
        public int TotalProducts { get; set; }
        public int TotalStockQuantity { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public List<StockReportItemDto> Items { get; set; } = new List<StockReportItemDto>();
    }

    public class SalesReportOrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
        public string PrimaryImageUrl { get; set; } = string.Empty;
    }

    public class SalesReportItemDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTimeOffset OrderDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public List<SalesReportOrderItemDto> OrderItems { get; set; } = new List<SalesReportOrderItemDto>();
    }

    public class SalesReportSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int TotalItemsSold { get; set; }
        public int DeliveredOrdersCount { get; set; }
        public int PendingOrdersCount { get; set; }
        public int CancelledOrdersCount { get; set; }
        public List<SalesReportItemDto> Items { get; set; } = new List<SalesReportItemDto>();
    }
}
