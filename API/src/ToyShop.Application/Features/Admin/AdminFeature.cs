using MediatR;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common;
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

    public record AdminSendForgotPasswordOtpCommand(string Email) : IRequest<BaseResponse<bool>>;

    public record AdminResetPasswordWithOtpCommand(
        string Email,
        string Otp,
        string NewPassword,
        string ConfirmPassword
    ) : IRequest<BaseResponse<bool>>;

    public record GetDashboardStatsQuery : IRequest<BaseResponse<DashboardStatsDto>>;

    // Handlers
    public class AdminCommandHandler :
        IRequestHandler<AdminLoginCommand, BaseResponse<AdminLoginResponseDto>>,
        IRequestHandler<AdminChangePasswordCommand, BaseResponse<bool>>,
        IRequestHandler<AdminSendForgotPasswordOtpCommand, BaseResponse<bool>>,
        IRequestHandler<AdminResetPasswordWithOtpCommand, BaseResponse<bool>>,
        IRequestHandler<GetDashboardStatsQuery, BaseResponse<DashboardStatsDto>>
    {
        private readonly IRepository<ToyShop.Domain.Entities.Admin> _adminRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<ToyShop.Domain.Entities.Shop> _shopRepository;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailService _emailService;
        private readonly OtpStore _otpStore;
        private readonly IUnitOfWork _unitOfWork;

        public AdminCommandHandler(
            IRepository<ToyShop.Domain.Entities.Admin> adminRepository,
            IRepository<Order> orderRepository,
            IRepository<Product> productRepository,
            IRepository<ToyShop.Domain.Entities.Shop> shopRepository,
            IJwtTokenService jwtTokenService,
            ICurrentUserService currentUserService,
            IEmailService emailService,
            OtpStore otpStore,
            IUnitOfWork unitOfWork)
        {
            _adminRepository = adminRepository;
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _shopRepository = shopRepository;
            _jwtTokenService = jwtTokenService;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _otpStore = otpStore;
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

        public async Task<BaseResponse<bool>> Handle(AdminSendForgotPasswordOtpCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BaseResponse<bool>.Fail("Email address or username is required");

            var trimmedEmail = request.Email.Trim().ToLower();

            // Find matching admin by Email or Username
            var admin = await _adminRepository.Query()
                .FirstOrDefaultAsync(a => (a.Email != null && a.Email.ToLower() == trimmedEmail) ||
                                          a.Username.ToLower() == trimmedEmail, cancellationToken);

            if (admin == null)
            {
                var shopInfo = await _shopRepository.Query().FirstOrDefaultAsync(cancellationToken);
                var isDefaultAdmin = (trimmedEmail == "admin" || trimmedEmail == "admin@store.com" ||
                                      (shopInfo != null && !string.IsNullOrEmpty(shopInfo.Email1) && shopInfo.Email1.ToLower() == trimmedEmail));
                if (isDefaultAdmin)
                {
                    admin = await _adminRepository.Query().FirstOrDefaultAsync(cancellationToken);
                }
            }

            if (admin == null)
            {
                return BaseResponse<bool>.Fail("No admin account found matching this email or username");
            }

            // Destination email address
            var targetEmail = !string.IsNullOrWhiteSpace(admin.Email)
                ? admin.Email.Trim()
                : (trimmedEmail.Contains('@') ? trimmedEmail : "admin@store.com");

            // Generate 6-digit OTP
            var bytes = new byte[4];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            var otpValue = Math.Abs(BitConverter.ToInt32(bytes, 0)) % 1000000;
            var otp = otpValue.ToString("D6");

            // Store in memory OTP store
            var storeKey = "admin_reset:" + trimmedEmail;
            _otpStore.Store(storeKey, otp);

            // Send OTP email
            try
            {
                await _emailService.SendOtpEmailAsync(targetEmail, otp, cancellationToken);
            }
            catch (Exception ex)
            {
                return BaseResponse<bool>.Fail($"Failed to send OTP email: {ex.Message}");
            }

            return BaseResponse<bool>.Ok(true, $"Reset OTP sent to {targetEmail}. Valid for 10 minutes.");
        }

        public async Task<BaseResponse<bool>> Handle(AdminResetPasswordWithOtpCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
                return BaseResponse<bool>.Fail("Email/Username and OTP are required");

            if (string.IsNullOrWhiteSpace(request.NewPassword) || string.IsNullOrWhiteSpace(request.ConfirmPassword))
                return BaseResponse<bool>.Fail("New password and confirm password are required");

            if (request.NewPassword != request.ConfirmPassword)
                return BaseResponse<bool>.Fail("New password and confirm password do not match");

            if (request.NewPassword.Length < 6)
                return BaseResponse<bool>.Fail("New password must be at least 6 characters long");

            var trimmedEmail = request.Email.Trim().ToLower();
            var storeKey = "admin_reset:" + trimmedEmail;

            var verifyResult = _otpStore.Verify(storeKey, request.Otp.Trim());
            if (verifyResult != OtpVerifyResult.Success)
            {
                return verifyResult switch
                {
                    OtpVerifyResult.Expired => BaseResponse<bool>.Fail("OTP has expired. Please request a new one."),
                    OtpVerifyResult.TooManyAttempts => BaseResponse<bool>.Fail("Too many failed attempts. Please request a new OTP."),
                    OtpVerifyResult.NotFound => BaseResponse<bool>.Fail("No OTP found for this account. Please request a new OTP."),
                    _ => BaseResponse<bool>.Fail("Invalid OTP code. Please try again.")
                };
            }

            // Find matching admin
            var admin = await _adminRepository.Query()
                .FirstOrDefaultAsync(a => (a.Email != null && a.Email.ToLower() == trimmedEmail) ||
                                          a.Username.ToLower() == trimmedEmail, cancellationToken);

            if (admin == null)
            {
                admin = await _adminRepository.Query().FirstOrDefaultAsync(cancellationToken);
            }

            if (admin == null)
            {
                return BaseResponse<bool>.Fail("Admin account not found");
            }

            // Hash new password using BCrypt
            string newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            admin.PasswordHash = newHash;
            admin.UpdatedDate = DateTimeOffset.UtcNow;

            _adminRepository.Update(admin);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Password reset successfully! Please sign in with your new password.");
        }
    }
}
