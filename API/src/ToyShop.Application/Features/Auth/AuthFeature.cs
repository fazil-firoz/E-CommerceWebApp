using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Shared.Models;

namespace ToyShop.Application.Features.Auth
{
    // ── DTOs ────────────────────────────────────────────────────────────
    public class CustomerLoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    // ── Commands ─────────────────────────────────────────────────────────
    /// <summary>Send OTP to the customer's email address.</summary>
    public record SendOtpCommand(string Email) : IRequest<BaseResponse<bool>>;

    /// <summary>Verify the OTP entered by the customer.</summary>
    public record VerifyOtpCommand(string Email, string Otp) : IRequest<BaseResponse<CustomerLoginDto>>;

    // ── Handlers ─────────────────────────────────────────────────────────
    public class AuthCommandHandler :
        IRequestHandler<SendOtpCommand, BaseResponse<bool>>,
        IRequestHandler<VerifyOtpCommand, BaseResponse<CustomerLoginDto>>
    {
        private readonly IEmailService _emailService;
        private readonly OtpStore _otpStore;

        public AuthCommandHandler(IEmailService emailService, OtpStore otpStore)
        {
            _emailService = emailService;
            _otpStore = otpStore;
        }

        public async Task<BaseResponse<bool>> Handle(SendOtpCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
                return BaseResponse<bool>.Fail("Please provide a valid email address");

            // Generate a secure 6-digit OTP
            var otp = GenerateOtp();

            // Store in memory (SHA256 hashed)
            _otpStore.Store(request.Email.Trim().ToLower(), otp);

            // Send the email
            try
            {
                await _emailService.SendOtpEmailAsync(request.Email.Trim(), otp, cancellationToken);
            }
            catch (Exception ex)
            {
                return BaseResponse<bool>.Fail($"Failed to send OTP email: {ex.Message}");
            }

            return BaseResponse<bool>.Ok(true, $"OTP sent to {request.Email}. Valid for 10 minutes.");
        }

        public async Task<BaseResponse<CustomerLoginDto>> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
                return BaseResponse<CustomerLoginDto>.Fail("Email and OTP are required");

            var result = _otpStore.Verify(request.Email.Trim().ToLower(), request.Otp.Trim());

            return result switch
            {
                OtpVerifyResult.Success => BaseResponse<CustomerLoginDto>.Ok(new CustomerLoginDto
                {
                    Email = request.Email.Trim().ToLower(),
                    Name = request.Email.Split('@')[0]
                }, "OTP verified successfully"),

                OtpVerifyResult.Expired  => BaseResponse<CustomerLoginDto>.Fail("OTP has expired. Please request a new one."),
                OtpVerifyResult.TooManyAttempts => BaseResponse<CustomerLoginDto>.Fail("Too many failed attempts. Please request a new OTP."),
                OtpVerifyResult.NotFound => BaseResponse<CustomerLoginDto>.Fail("No OTP found for this email. Please request a new one."),
                _ => BaseResponse<CustomerLoginDto>.Fail("Invalid OTP. Please try again.")
            };
        }

        private static string GenerateOtp()
        {
            // Cryptographically secure random 6-digit OTP
            var bytes = new byte[4];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            var value = Math.Abs(BitConverter.ToInt32(bytes, 0)) % 1000000;
            return value.ToString("D6"); // Zero-padded to 6 digits
        }
    }
}
