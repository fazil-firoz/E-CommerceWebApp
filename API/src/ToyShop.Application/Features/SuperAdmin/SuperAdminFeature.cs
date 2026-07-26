using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Domain.Entities;
using ToyShop.Shared.Models;

namespace ToyShop.Application.Features.SuperAdmin
{
    // DTOs & Requests
    public class SuperAdminControlDto
    {
        public bool IsShopSettingsMenuEnabled { get; set; } = true;
        public bool IsShipmentSettingsMenuEnabled { get; set; } = true;
        public bool IsInvoiceSettingsMenuEnabled { get; set; } = true;
        public bool IsTaxSettingsMenuEnabled { get; set; } = true;
        public bool IsReportsMenuEnabled { get; set; } = true;
        public bool IsCouponMenuEnabled { get; set; } = true;
        public bool IsAppControlMenuEnabled { get; set; } = true;
        public bool IsWhatsAppFloatingWidgetEnabled { get; set; } = true;
        public bool IsPrintInvoiceEnabled { get; set; } = true;
        public bool IsProductBadgeEnabled { get; set; } = true;
        public bool IsWishlistEnabled { get; set; } = true;
    }

    public class UpdateSuperAdminControlRequest
    {
        public bool IsShopSettingsMenuEnabled { get; set; }
        public bool IsShipmentSettingsMenuEnabled { get; set; }
        public bool IsInvoiceSettingsMenuEnabled { get; set; }
        public bool IsTaxSettingsMenuEnabled { get; set; }
        public bool IsReportsMenuEnabled { get; set; }
        public bool IsCouponMenuEnabled { get; set; }
        public bool IsAppControlMenuEnabled { get; set; }
        public bool IsWhatsAppFloatingWidgetEnabled { get; set; }
        public bool IsPrintInvoiceEnabled { get; set; }
        public bool IsProductBadgeEnabled { get; set; }
        public bool IsWishlistEnabled { get; set; }
    }

    public class SuperAdminLoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // Queries & Commands
    public record GetSuperAdminControlQuery : IRequest<BaseResponse<SuperAdminControlDto>>;

    public record VerifySuperAdminCredentialsQuery(string Username, string Password) : IRequest<BaseResponse<bool>>;

    public record UpdateSuperAdminControlCommand(UpdateSuperAdminControlRequest Request) : IRequest<BaseResponse<SuperAdminControlDto>>;

    public record ResetDatabaseCommand(string ConfirmationWord) : IRequest<BaseResponse<bool>>;

    // Handlers
    public class SuperAdminCommandHandler :
        IRequestHandler<GetSuperAdminControlQuery, BaseResponse<SuperAdminControlDto>>,
        IRequestHandler<VerifySuperAdminCredentialsQuery, BaseResponse<bool>>,
        IRequestHandler<UpdateSuperAdminControlCommand, BaseResponse<SuperAdminControlDto>>,
        IRequestHandler<ResetDatabaseCommand, BaseResponse<bool>>
    {
        private readonly IRepository<SuperAdminControl> _controlRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public SuperAdminCommandHandler(
            IRepository<SuperAdminControl> controlRepo,
            IUnitOfWork unitOfWork,
            IConfiguration configuration)
        {
            _controlRepo = controlRepo;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<BaseResponse<SuperAdminControlDto>> Handle(GetSuperAdminControlQuery request, CancellationToken cancellationToken)
        {
            var control = await _controlRepo.Query().FirstOrDefaultAsync(cancellationToken);
            if (control == null)
            {
                control = new SuperAdminControl
                {
                    IsShopSettingsMenuEnabled = true,
                    IsShipmentSettingsMenuEnabled = true,
                    IsInvoiceSettingsMenuEnabled = true,
                    IsTaxSettingsMenuEnabled = true,
                    IsReportsMenuEnabled = true,
                    IsAppControlMenuEnabled = true,
                    IsWhatsAppFloatingWidgetEnabled = true
                };
                await _controlRepo.AddAsync(control, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return BaseResponse<SuperAdminControlDto>.Ok(MapToDto(control), "Super Admin control settings retrieved successfully");
        }

        public async Task<BaseResponse<bool>> Handle(VerifySuperAdminCredentialsQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BaseResponse<bool>.Fail("Username and password are required");

            var configuredUsername = _configuration["SuperAdminSettings:Username"] ?? _configuration["SuperAdmin:Username"] ?? "superadmin";
            var configuredPassword = _configuration["SuperAdminSettings:Password"] ?? _configuration["SuperAdmin:Password"] ?? "SuperAdminPassword123!";

            if (request.Username.Trim() == configuredUsername && request.Password == configuredPassword)
            {
                return BaseResponse<bool>.Ok(true, "Super Admin verification successful");
            }

            return BaseResponse<bool>.Fail("Invalid Super Admin credentials");
        }

        public async Task<BaseResponse<SuperAdminControlDto>> Handle(UpdateSuperAdminControlCommand request, CancellationToken cancellationToken)
        {
            var control = await _controlRepo.Query().FirstOrDefaultAsync(cancellationToken);
            if (control == null)
            {
                control = new SuperAdminControl();
                await _controlRepo.AddAsync(control, cancellationToken);
            }

            control.IsShopSettingsMenuEnabled = request.Request.IsShopSettingsMenuEnabled;
            control.IsShipmentSettingsMenuEnabled = request.Request.IsShipmentSettingsMenuEnabled;
            control.IsInvoiceSettingsMenuEnabled = request.Request.IsInvoiceSettingsMenuEnabled;
            control.IsTaxSettingsMenuEnabled = request.Request.IsTaxSettingsMenuEnabled;
            control.IsReportsMenuEnabled = request.Request.IsReportsMenuEnabled;
            control.IsCouponMenuEnabled = request.Request.IsCouponMenuEnabled;
            control.IsAppControlMenuEnabled = request.Request.IsShipmentSettingsMenuEnabled;
            control.IsWhatsAppFloatingWidgetEnabled = request.Request.IsWhatsAppFloatingWidgetEnabled;
            control.IsPrintInvoiceEnabled = request.Request.IsPrintInvoiceEnabled;
            control.IsProductBadgeEnabled = request.Request.IsProductBadgeEnabled;
            control.IsWishlistEnabled = request.Request.IsWishlistEnabled;
            control.UpdatedDate = System.DateTimeOffset.UtcNow;

            _controlRepo.Update(control);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<SuperAdminControlDto>.Ok(MapToDto(control), "Super Admin controls updated successfully");
        }

        public async Task<BaseResponse<bool>> Handle(ResetDatabaseCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.ConfirmationWord) || !request.ConfirmationWord.Trim().Equals("RESET DATABASE", System.StringComparison.OrdinalIgnoreCase))
            {
                return BaseResponse<bool>.Fail("Invalid confirmation word. You must type 'RESET DATABASE' to confirm clearing system tables.");
            }

            try
            {
                // Truncate transactional & master data tables safely (including Shops)
                await _unitOfWork.ExecuteRawSqlAsync(@"
                    TRUNCATE TABLE ""OrderItems"", ""Orders"", ""Payments"", ""ProductImages"", ""Products"", ""Categories"", ""CouponCodes"", ""Addresses"", ""Customers"", ""Shops"" RESTART IDENTITY CASCADE;
                ", cancellationToken);

                return BaseResponse<bool>.Ok(true, "All database tables cleared successfully. System has been reset to factory defaults.");
            }
            catch (System.Exception ex)
            {
                return BaseResponse<bool>.Fail("Database reset failed: " + ex.Message);
            }
        }

        private static SuperAdminControlDto MapToDto(SuperAdminControl c) => new SuperAdminControlDto
        {
            IsShopSettingsMenuEnabled = c.IsShopSettingsMenuEnabled,
            IsShipmentSettingsMenuEnabled = c.IsShipmentSettingsMenuEnabled,
            IsInvoiceSettingsMenuEnabled = c.IsInvoiceSettingsMenuEnabled,
            IsTaxSettingsMenuEnabled = c.IsTaxSettingsMenuEnabled,
            IsReportsMenuEnabled = c.IsReportsMenuEnabled,
            IsCouponMenuEnabled = c.IsCouponMenuEnabled,
            IsAppControlMenuEnabled = c.IsShipmentSettingsMenuEnabled,
            IsWhatsAppFloatingWidgetEnabled = c.IsWhatsAppFloatingWidgetEnabled,
            IsPrintInvoiceEnabled = c.IsPrintInvoiceEnabled,
            IsProductBadgeEnabled = c.IsProductBadgeEnabled,
            IsWishlistEnabled = c.IsWishlistEnabled
        };
    }
}
