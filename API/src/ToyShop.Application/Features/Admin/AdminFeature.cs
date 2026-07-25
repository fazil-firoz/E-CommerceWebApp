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

    public record AdminChangePasswordCommand(
        string CurrentPassword,
        string NewPassword,
        string ConfirmPassword
    ) : IRequest<BaseResponse<bool>>;

    public record GetDashboardStatsQuery : IRequest<BaseResponse<DashboardStatsDto>>;

    // Handlers
    public class AdminCommandHandler :
        IRequestHandler<AdminLoginCommand, BaseResponse<AdminLoginResponseDto>>,
        IRequestHandler<AdminChangePasswordCommand, BaseResponse<bool>>,
        IRequestHandler<GetDashboardStatsQuery, BaseResponse<DashboardStatsDto>>
    {
        private readonly IRepository<ToyShop.Domain.Entities.Admin> _adminRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public AdminCommandHandler(
            IRepository<ToyShop.Domain.Entities.Admin> adminRepository,
            IRepository<Order> orderRepository,
            IRepository<Product> productRepository,
            IJwtTokenService jwtTokenService,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _adminRepository = adminRepository;
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _jwtTokenService = jwtTokenService;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
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

        public async Task<BaseResponse<bool>> Handle(AdminChangePasswordCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request.NewPassword) ||
                string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                return BaseResponse<bool>.Fail("All password fields are required");
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BaseResponse<bool>.Fail("New password and confirm password do not match");
            }

            if (request.NewPassword.Length < 6)
            {
                return BaseResponse<bool>.Fail("New password must be at least 6 characters long");
            }

            var username = _currentUserService.Username;
            ToyShop.Domain.Entities.Admin? admin = null;

            if (!string.IsNullOrWhiteSpace(username))
            {
                admin = await _adminRepository.Query()
                    .FirstOrDefaultAsync(a => a.Username.ToLower() == username.ToLower(), cancellationToken);
            }

            // Fallback if username claim not populated in context
            if (admin == null)
            {
                admin = await _adminRepository.Query().FirstOrDefaultAsync(cancellationToken);
            }

            if (admin == null)
            {
                return BaseResponse<bool>.Fail("Admin account not found");
            }

            // Verify current password
            bool isCurrentPasswordValid = false;
            try
            {
                isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, admin.PasswordHash);
            }
            catch
            {
                isCurrentPasswordValid = request.CurrentPassword == admin.PasswordHash;
            }

            if (!isCurrentPasswordValid)
            {
                return BaseResponse<bool>.Fail("Current password is incorrect");
            }

            // Hash new password using BCrypt
            string newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            admin.PasswordHash = newHash;
            admin.UpdatedDate = DateTimeOffset.UtcNow;

            _adminRepository.Update(admin);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Password changed successfully!");
        }

        public async Task<BaseResponse<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var totalOrders = await _orderRepository.Query()
                .Where(o => o.PaymentStatus == PaymentStatus.Success)
                .CountAsync(cancellationToken);
            
            // Use explicit UTC DateTimeOffset - PostgreSQL timestamptz only accepts offset=0
            var todayStart = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero).AddDays(-1);
            var todayEnd = todayStart.AddDays(2);
            var todaysOrders = await _orderRepository.Query()
                .Where(o => o.PaymentStatus == PaymentStatus.Success && o.OrderDate >= todayStart && o.OrderDate < todayEnd)
                .CountAsync(cancellationToken);

            var totalProducts = await _productRepository.Query()
                .Where(p => p.IsActive)
                .CountAsync(cancellationToken);

            var totalRevenue = await _orderRepository.Query()
                .Where(o => o.PaymentStatus == PaymentStatus.Success)
                .SumAsync(o => o.TotalAmount, cancellationToken);

            var pendingOrders = await _orderRepository.Query()
                .Where(o => o.PaymentStatus == PaymentStatus.Success && o.OrderStatus == OrderStatus.Pending)
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
