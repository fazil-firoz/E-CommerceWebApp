using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Application.DTOs;
using ToyShop.Domain.Entities;
using ToyShop.Domain.Enums;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ToyShop.Shared.Models;
using System;

namespace ToyShop.Application.Features.Orders
{
    // DTOs for Order Feature
    public record CreateOrderItemInput(int ProductId, int Quantity);

    public class RazorpayOrderResponseDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string RazorpayOrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string RazorpayKey { get; set; } = string.Empty;
    }

    // Queries
    public record GetOrdersQuery(
        int? OrderStatus = null,
        DateTimeOffset? StartDate = null,
        DateTimeOffset? EndDate = null,
        string? Search = null,
        string? CustomerEmail = null
    ) : IRequest<BaseResponse<List<OrderDto>>>;

    public record GetOrderByIdQuery(int Id) : IRequest<BaseResponse<OrderDto>>;

    // Commands
    public record CreateOrderCommand(
        string CustomerName,
        string? CustomerEmail,      // Optional - guest checkout without email still works
        string CustomerPhone,       // Required
        string AddressLine1,
        string? AddressLine2,
        string City,
        string State,
        string Pincode,
        List<CreateOrderItemInput> Items,
        string? CouponCode = null,
        decimal DiscountAmount = 0
    ) : IRequest<BaseResponse<RazorpayOrderResponseDto>>;

    /// <summary>
    /// Update order status. When OrderStatus = Shipped (value 2), 
    /// CourierName and TrackingNumber are required and a shipment email is automatically sent.
    /// </summary>
    public record UpdateOrderStatusCommand(
        int OrderId,
        int OrderStatus,
        string? CourierName,
        string? TrackingNumber
    ) : IRequest<BaseResponse<bool>>;

    // Handlers
    public class OrdersQueryHandler :
        IRequestHandler<GetOrdersQuery, BaseResponse<List<OrderDto>>>,
        IRequestHandler<GetOrderByIdQuery, BaseResponse<OrderDto>>
    {
        private readonly IRepository<Order> _orderRepository;

        public OrdersQueryHandler(IRepository<Order> orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public async Task<BaseResponse<List<OrderDto>>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        {
            var query = _orderRepository.Query()
                .Include(o => o.Customer)
                .Include(o => o.Address)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o => o.PaymentStatus == PaymentStatus.Success)
                .AsQueryable();

            if (request.OrderStatus.HasValue)
            {
                query = query.Where(o => (int)o.OrderStatus == request.OrderStatus.Value);
            }

            if (request.StartDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= request.EndDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
            {
                var targetEmail = request.CustomerEmail.Trim().ToLower();
                query = query.Where(o => (o.CustomerEmail != null && o.CustomerEmail.ToLower() == targetEmail) ||
                                         (o.Customer != null && o.Customer.Email != null && o.Customer.Email.ToLower() == targetEmail));
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var s = request.Search.ToLower();
                query = query.Where(o => o.OrderNumber.ToLower().Contains(s) ||
                                         (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(s)) ||
                                         (o.CustomerPhone != null && o.CustomerPhone.Contains(s)) ||
                                         (o.Customer != null && o.Customer.Name.ToLower().Contains(s)));
            }

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Select(o => MapToDto(o))
                .ToListAsync(cancellationToken);

            return BaseResponse<List<OrderDto>>.Ok(orders, "Orders retrieved successfully");
        }

        public async Task<BaseResponse<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.Query()
                .Include(o => o.Customer)
                .Include(o => o.Address)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (order == null)
                return BaseResponse<OrderDto>.Fail("Order not found");

            return BaseResponse<OrderDto>.Ok(MapToDto(order), "Order retrieved successfully");
        }

        private static OrderDto MapToDto(Order o) => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            TotalAmount = o.TotalAmount,
            CouponCode = o.CouponCode,
            DiscountAmount = o.DiscountAmount,
            OrderStatus = o.OrderStatus.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            OrderDate = o.OrderDate,
            CustomerEmail = o.CustomerEmail,
            CustomerPhone = o.CustomerPhone,
            CourierName = o.CourierName,
            TrackingNumber = o.TrackingNumber,
            ShippedDate = o.ShippedDate,
            Customer = o.Customer != null ? new CustomerDto
            {
                Id = o.Customer.Id,
                Name = o.Customer.Name,
                Email = o.Customer.Email,
                PhoneNumber = o.Customer.PhoneNumber
            } : null,
            Address = o.Address != null ? new AddressDto
            {
                Id = o.Address.Id,
                FullName = o.Address.FullName,
                PhoneNumber = o.Address.PhoneNumber,
                AddressLine1 = o.Address.AddressLine1,
                AddressLine2 = o.Address.AddressLine2,
                City = o.Address.City,
                State = o.Address.State,
                Pincode = o.Address.Pincode
            } : null,
            Items = o.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product != null ? oi.Product.Name : "Product Item",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            }).ToList()
        };
    }

    public class OrdersCommandHandler :
        IRequestHandler<CreateOrderCommand, BaseResponse<RazorpayOrderResponseDto>>,
        IRequestHandler<UpdateOrderStatusCommand, BaseResponse<bool>>
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Address> _addressRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRazorpayService _razorpayService;
        private readonly IEmailService _emailService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public OrdersCommandHandler(
            IRepository<Order> orderRepository,
            IRepository<Customer> customerRepository,
            IRepository<Address> addressRepository,
            IRepository<Product> productRepository,
            IRazorpayService razorpayService,
            IEmailService emailService,
            IUnitOfWork unitOfWork,
            Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
            _addressRepository = addressRepository;
            _productRepository = productRepository;
            _razorpayService = razorpayService;
            _emailService = emailService;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<BaseResponse<RazorpayOrderResponseDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            // Phone is always required; email is optional for guest checkout
            if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerPhone))
                return BaseResponse<RazorpayOrderResponseDto>.Fail("Customer name and phone number are required");

            if (request.Items == null || request.Items.Count == 0)
                return BaseResponse<RazorpayOrderResponseDto>.Fail("Order must contain at least one item");

            // Check stocks & fetch prices
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in request.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
                if (product == null || !product.IsActive)
                    return BaseResponse<RazorpayOrderResponseDto>.Fail($"Product ID {item.ProductId} is not available");

                if (product.StockQuantity < item.Quantity)
                    return BaseResponse<RazorpayOrderResponseDto>.Fail($"Insufficient stock for {product.Name}. Available: {product.StockQuantity}");

                var itemTotal = product.Price * item.Quantity;
                totalAmount += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = itemTotal
                });
            }

            // Find or create customer record
            Customer? customer = null;
            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
            {
                customer = await _customerRepository.Query()
                    .FirstOrDefaultAsync(c => c.Email.ToLower() == request.CustomerEmail.ToLower(), cancellationToken);
            }

            if (customer == null && !string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                customer = await _customerRepository.Query()
                    .FirstOrDefaultAsync(c => c.PhoneNumber == request.CustomerPhone, cancellationToken);
            }

            if (customer == null)
            {
                customer = new Customer
                {
                    Name = request.CustomerName,
                    Email = request.CustomerEmail ?? string.Empty,
                    PhoneNumber = request.CustomerPhone
                };
                await _customerRepository.AddAsync(customer, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            // Save Address
            var address = new Address
            {
                CustomerId = customer.Id,
                FullName = request.CustomerName,
                PhoneNumber = request.CustomerPhone,
                AddressLine1 = request.AddressLine1,
                AddressLine2 = request.AddressLine2,
                City = request.City,
                State = request.State,
                Pincode = request.Pincode
            };
            await _addressRepository.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Generate unique Order Number
            var orderNumber = "ORD-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + new Random().Next(1000, 9999);

            // Apply discount if provided
            var finalTotalAmount = request.DiscountAmount > 0 ? Math.Max(0, totalAmount - request.DiscountAmount) : totalAmount;

            // Create Order - store contact directly on order for guest tracking
            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerId = customer.Id,
                AddressId = address.Id,
                TotalAmount = finalTotalAmount,
                CouponCode = request.CouponCode,
                DiscountAmount = request.DiscountAmount,
                OrderStatus = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                CustomerEmail = request.CustomerEmail,
                CustomerPhone = request.CustomerPhone,
                OrderItems = orderItems
            };

            await _orderRepository.AddAsync(order, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Create Razorpay Order
            string razorpayOrderId;
            try
            {
                razorpayOrderId = await _razorpayService.CreateOrderAsync(finalTotalAmount, orderNumber, cancellationToken);
            }
            catch (Exception ex)
            {
                return BaseResponse<RazorpayOrderResponseDto>.Fail("Razorpay order creation failed: " + ex.Message);
            }

            var key = _configuration["Razorpay:KeyId"] ?? "";

            var response = new RazorpayOrderResponseDto
            {
                OrderId = order.Id,
                OrderNumber = orderNumber,
                RazorpayOrderId = razorpayOrderId,
                Amount = totalAmount,
                RazorpayKey = key
            };

            return BaseResponse<RazorpayOrderResponseDto>.Ok(response, "Order placed successfully. Complete payment to finalize.");
        }

        public async Task<BaseResponse<bool>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.Query()
                .Include(o => o.Customer)
                .Include(o => o.Address)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                return BaseResponse<bool>.Fail("Order not found");

            var newStatus = (OrderStatus)request.OrderStatus;

            // When marking as Shipped, courier details are mandatory
            if (newStatus == OrderStatus.Shipped)
            {
                if (string.IsNullOrWhiteSpace(request.CourierName))
                    return BaseResponse<bool>.Fail("Courier name is required when marking order as Shipped");

                if (string.IsNullOrWhiteSpace(request.TrackingNumber))
                    return BaseResponse<bool>.Fail("Tracking number is required when marking order as Shipped");

                order.CourierName = request.CourierName.Trim();
                order.TrackingNumber = request.TrackingNumber.Trim();
                order.ShippedDate = DateTimeOffset.UtcNow;
            }

            order.OrderStatus = newStatus;
            order.UpdatedDate = DateTimeOffset.UtcNow;

            _orderRepository.Update(order);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Send Shipment Notification Email to customer when status changes to Shipped
            if (newStatus == OrderStatus.Shipped)
            {
                var recipientEmail = !string.IsNullOrWhiteSpace(order.CustomerEmail) ? order.CustomerEmail : order.Customer?.Email;
                if (!string.IsNullOrWhiteSpace(recipientEmail) && recipientEmail.Contains("@"))
                {
                    var customerName = order.Address?.FullName ?? order.Customer?.Name ?? "Valued Customer";
                    try
                    {
                        await _emailService.SendShipmentNotificationAsync(
                            recipientEmail.Trim(),
                            customerName,
                            order.OrderNumber,
                            order.CourierName ?? "Courier",
                            order.TrackingNumber ?? "N/A",
                            order.TotalAmount,
                            cancellationToken
                        );
                    }
                    catch (Exception ex)
                    {
                        // Log email error, but order status update remains successful in DB
                        System.Diagnostics.Debug.WriteLine($"Failed to send shipment email: {ex.Message}");
                    }
                }
            }

            return BaseResponse<bool>.Ok(true, $"Order #{order.OrderNumber} status updated to {order.OrderStatus}. {(newStatus == OrderStatus.Shipped ? "Shipment notification email sent to customer!" : "")}");
        }
    }
}
