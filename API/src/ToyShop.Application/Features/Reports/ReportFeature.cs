using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Application.DTOs;
using ToyShop.Domain.Entities;
using ToyShop.Domain.Enums;
using ToyShop.Shared.Models;

namespace ToyShop.Application.Features.Reports
{
    // Queries
    public record GetStockReportQuery(
        int? CategoryId = null,
        string? StockStatus = null,
        string? Search = null
    ) : IRequest<BaseResponse<StockReportSummaryDto>>;

    public record GetSalesReportQuery(
        string? PeriodPreset = null, // daily, monthly, yearly, all, custom
        DateTimeOffset? StartDate = null,
        DateTimeOffset? EndDate = null,
        string? OrderStatus = null,
        string? CustomerName = null,
        string? CustomerPhone = null,
        string? Search = null
    ) : IRequest<BaseResponse<SalesReportSummaryDto>>;

    // Handlers
    public class ReportQueryHandler :
        IRequestHandler<GetStockReportQuery, BaseResponse<StockReportSummaryDto>>,
        IRequestHandler<GetSalesReportQuery, BaseResponse<SalesReportSummaryDto>>
    {
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<Order> _orderRepo;

        public ReportQueryHandler(IRepository<Product> productRepo, IRepository<Order> orderRepo)
        {
            _productRepo = productRepo;
            _orderRepo = orderRepo;
        }

        public async Task<BaseResponse<StockReportSummaryDto>> Handle(GetStockReportQuery request, CancellationToken cancellationToken)
        {
            var query = _productRepo.Query()
                .Include(p => p.Category)
                .Include(p => p.Images)
                .AsQueryable();

            if (request.CategoryId.HasValue && request.CategoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(search) || (p.Category != null && p.Category.Name.ToLower().Contains(search)));
            }

            var products = await query.OrderBy(p => p.Name).ToListAsync(cancellationToken);

            var items = new List<StockReportItemDto>();
            int lowStockCount = 0;
            int outOfStockCount = 0;
            int totalStockQty = 0;
            decimal totalInventoryValue = 0;

            foreach (var p in products)
            {
                string status = "InStock";
                if (p.StockQuantity == 0)
                {
                    status = "OutOfStock";
                    outOfStockCount++;
                }
                else if (p.StockQuantity <= 5)
                {
                    status = "LowStock";
                    lowStockCount++;
                }

                // Check stock status filter
                if (!string.IsNullOrWhiteSpace(request.StockStatus) && !request.StockStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
                {
                    if (!status.Equals(request.StockStatus, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }
                }

                decimal totalVal = p.Price * p.StockQuantity;
                totalStockQty += p.StockQuantity;
                totalInventoryValue += totalVal;

                var mainImage = p.Images.FirstOrDefault(i => i.IsMain) ?? p.Images.FirstOrDefault();

                items.Add(new StockReportItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    CategoryName = p.Category?.Name ?? "Unassigned",
                    Mrp = p.Mrp > 0 ? p.Mrp : p.Price,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    TotalStockValue = totalVal,
                    StockStatus = status,
                    PrimaryImageUrl = mainImage?.ImageUrl ?? string.Empty
                });
            }

            var summary = new StockReportSummaryDto
            {
                TotalProducts = items.Count,
                TotalStockQuantity = totalStockQty,
                TotalInventoryValue = totalInventoryValue,
                LowStockCount = lowStockCount,
                OutOfStockCount = outOfStockCount,
                Items = items
            };

            return BaseResponse<StockReportSummaryDto>.Ok(summary, "Stock report generated successfully");
        }

        public async Task<BaseResponse<SalesReportSummaryDto>> Handle(GetSalesReportQuery request, CancellationToken cancellationToken)
        {
            var query = _orderRepo.Query()
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Category)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Images)
                .Include(o => o.Customer)
                .Where(o => o.PaymentStatus == PaymentStatus.Success)
                .AsQueryable();

            // Date filtering
            DateTimeOffset now = DateTimeOffset.UtcNow;
            if (!string.IsNullOrWhiteSpace(request.PeriodPreset))
            {
                var preset = request.PeriodPreset.ToLower();
                if (preset == "daily" || preset == "today")
                {
                    // Include all orders from today (accounting for local timezone offset up to UTC-12 to UTC+14)
                    var todayStart = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, TimeSpan.Zero).AddDays(-1);
                    query = query.Where(o => o.OrderDate >= todayStart);
                }
                else if (preset == "monthly" || preset == "this_month")
                {
                    var monthStart = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero).AddDays(-1);
                    query = query.Where(o => o.OrderDate >= monthStart);
                }
                else if (preset == "yearly" || preset == "this_year")
                {
                    var yearStart = new DateTimeOffset(now.Year, 1, 1, 0, 0, 0, TimeSpan.Zero);
                    query = query.Where(o => o.OrderDate >= yearStart);
                }
            }

            if (request.StartDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                var endDateUtc = request.EndDate.Value.AddDays(1).AddTicks(-1);
                query = query.Where(o => o.OrderDate <= endDateUtc);
            }

            // Order status filter
            if (!string.IsNullOrWhiteSpace(request.OrderStatus) && !request.OrderStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                var statusStr = request.OrderStatus.ToLower();
                query = query.Where(o => o.OrderStatus.ToString().ToLower() == statusStr);
            }

            // Customer Name filter
            if (!string.IsNullOrWhiteSpace(request.CustomerName))
            {
                var name = request.CustomerName.Trim().ToLower();
                query = query.Where(o =>
                    (o.Customer != null && o.Customer.Name.ToLower().Contains(name)) ||
                    (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(name)));
            }

            // Customer Phone filter
            if (!string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                var phone = request.CustomerPhone.Trim().ToLower();
                query = query.Where(o =>
                    (o.CustomerPhone != null && o.CustomerPhone.ToLower().Contains(phone)) ||
                    (o.Customer != null && o.Customer.PhoneNumber != null && o.Customer.PhoneNumber.ToLower().Contains(phone)));
            }

            // Search filter
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                query = query.Where(o =>
                    o.OrderNumber.ToLower().Contains(search) ||
                    (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(search)) ||
                    (o.CustomerPhone != null && o.CustomerPhone.ToLower().Contains(search)) ||
                    (o.Customer != null && o.Customer.Name.ToLower().Contains(search)));
            }

            var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync(cancellationToken);

            var items = new List<SalesReportItemDto>();
            decimal totalRevenue = 0;
            int totalItemsSold = 0;
            int deliveredCount = 0;
            int pendingCount = 0;
            int cancelledCount = 0;

            foreach (var o in orders)
            {
                int itemsCount = o.OrderItems.Sum(i => i.Quantity);
                totalItemsSold += itemsCount;

                string oStatus = o.OrderStatus.ToString();
                string pStatus = o.PaymentStatus.ToString();
                string custName = o.Customer != null ? o.Customer.Name : (o.CustomerEmail ?? "Guest Customer");

                if (oStatus.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
                {
                    deliveredCount++;
                    totalRevenue += o.TotalAmount;
                }
                else if (oStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
                {
                    cancelledCount++;
                }
                else
                {
                    pendingCount++;
                    totalRevenue += o.TotalAmount;
                }

                var orderItemDtos = o.OrderItems.Select(i => new SalesReportOrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product != null ? i.Product.Name : "Product #" + i.ProductId,
                    CategoryName = i.Product?.Category != null ? i.Product.Category.Name : "General Toys",
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    Subtotal = i.TotalPrice > 0 ? i.TotalPrice : i.UnitPrice * i.Quantity,
                    PrimaryImageUrl = i.Product?.Images?.FirstOrDefault(img => img.IsMain)?.ImageUrl ?? i.Product?.Images?.FirstOrDefault()?.ImageUrl ?? string.Empty
                }).ToList();

                items.Add(new SalesReportItemDto
                {
                    OrderId = o.Id,
                    OrderNumber = o.OrderNumber,
                    OrderDate = o.OrderDate,
                    CustomerName = string.IsNullOrWhiteSpace(custName) ? "Guest Customer" : custName,
                    CustomerPhone = o.CustomerPhone ?? o.Customer?.PhoneNumber ?? "N/A",
                    TotalItems = itemsCount,
                    TotalAmount = o.TotalAmount,
                    OrderStatus = oStatus,
                    PaymentStatus = pStatus,
                    OrderItems = orderItemDtos
                });
            }

            decimal avgOrderVal = items.Count > 0 ? Math.Round(totalRevenue / items.Count, 2) : 0;

            var summary = new SalesReportSummaryDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = items.Count,
                AverageOrderValue = avgOrderVal,
                TotalItemsSold = totalItemsSold,
                DeliveredOrdersCount = deliveredCount,
                PendingOrdersCount = pendingCount,
                CancelledOrdersCount = cancelledCount,
                Items = items
            };

            return BaseResponse<SalesReportSummaryDto>.Ok(summary, "Sales report generated successfully");
        }
    }
}
