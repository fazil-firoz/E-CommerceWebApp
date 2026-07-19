using MediatR;
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

namespace ToyShop.Application.Features.Admin
{
    // DTOs
    public class AdminLoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    // Commands & Queries
    public record AdminLoginCommand(string Username, string Password) : IRequest<BaseResponse<AdminLoginResponseDto>>;

    public record GetDashboardStatsQuery : IRequest<BaseResponse<DashboardStatsDto>>;

    // Handlers
    public class AdminCommandHandler :
        IRequestHandler<AdminLoginCommand, BaseResponse<AdminLoginResponseDto>>,
        IRequestHandler<GetDashboardStatsQuery, BaseResponse<DashboardStatsDto>>
    {
        private readonly IRepository<ToyShop.Domain.Entities.Admin> _adminRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IJwtTokenService _jwtTokenService;

        public AdminCommandHandler(
            IRepository<ToyShop.Domain.Entities.Admin> adminRepository,
            IRepository<Order> orderRepository,
            IRepository<Product> productRepository,
            IJwtTokenService jwtTokenService)
        {
            _adminRepository = adminRepository;
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<BaseResponse<AdminLoginResponseDto>> Handle(AdminLoginCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BaseResponse<AdminLoginResponseDto>.Fail("Username and password are required");

            var admin = await _adminRepository.Query()
                .FirstOrDefaultAsync(a => a.Username == request.Username, cancellationToken);

            if (admin == null)
                return BaseResponse<AdminLoginResponseDto>.Fail("Invalid username or password");

            // Verify password using BCrypt
            bool isPasswordCorrect = false;
            try
            {
                isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash);
            }
            catch
            {
                // Fallback for development if password hash was plain text or wrong format
                isPasswordCorrect = request.Password == admin.PasswordHash;
            }

            if (!isPasswordCorrect)
                return BaseResponse<AdminLoginResponseDto>.Fail("Invalid username or password");

            var token = _jwtTokenService.GenerateToken(admin);

            return BaseResponse<AdminLoginResponseDto>.Ok(new AdminLoginResponseDto
            {
                Token = token,
                Username = admin.Username,
                FullName = admin.FullName
            }, "Login successful");
        }

        public async Task<BaseResponse<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var totalOrders = await _orderRepository.Query().CountAsync(cancellationToken);
            
            // Use explicit UTC DateTimeOffset - PostgreSQL timestamptz only accepts offset=0
            var todayStart = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);
            var todayEnd = todayStart.AddDays(1);
            var todaysOrders = await _orderRepository.Query()
                .Where(o => o.OrderDate >= todayStart && o.OrderDate < todayEnd)
                .CountAsync(cancellationToken);

            var totalProducts = await _productRepository.Query()
                .Where(p => p.IsActive)
                .CountAsync(cancellationToken);

            var totalRevenue = await _orderRepository.Query()
                .Where(o => o.PaymentStatus == PaymentStatus.Success)
                .SumAsync(o => o.TotalAmount, cancellationToken);

            var pendingOrders = await _orderRepository.Query()
                .Where(o => o.OrderStatus == OrderStatus.Pending)
                .CountAsync(cancellationToken);

            var stats = new DashboardStatsDto
            {
                TotalOrders = totalOrders,
                TodaysOrders = todaysOrders,
                TotalProducts = totalProducts,
                TotalRevenue = totalRevenue,
                PendingOrders = pendingOrders
            };

            return BaseResponse<DashboardStatsDto>.Ok(stats, "Dashboard statistics retrieved successfully");
        }
    }
}
