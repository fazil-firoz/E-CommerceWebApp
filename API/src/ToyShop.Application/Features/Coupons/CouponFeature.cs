using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Domain.Entities;
using ToyShop.Shared.Models;

namespace ToyShop.Application.Features.Coupons
{
    // DTOs & Requests
    public class CouponDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        public decimal MinPurchaseAmount { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
    }

    public class CouponValidationResultDto
    {
        public bool IsValid { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public decimal MinPurchaseAmount { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class CreateCouponRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        public decimal MinPurchaseAmount { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCouponRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        public decimal MinPurchaseAmount { get; set; }
        public bool IsActive { get; set; }
    }

    // Queries & Commands
    public record GetCouponsQuery : IRequest<BaseResponse<List<CouponDto>>>;

    public record ValidateCouponQuery(string Code, decimal PurchaseAmount) : IRequest<BaseResponse<CouponValidationResultDto>>;

    public record CreateCouponCommand(CreateCouponRequest Request) : IRequest<BaseResponse<CouponDto>>;

    public record UpdateCouponCommand(int Id, UpdateCouponRequest Request) : IRequest<BaseResponse<CouponDto>>;

    public record DeleteCouponCommand(int Id) : IRequest<BaseResponse<bool>>;

    // Handlers
    public class CouponCommandHandler :
        IRequestHandler<GetCouponsQuery, BaseResponse<List<CouponDto>>>,
        IRequestHandler<ValidateCouponQuery, BaseResponse<CouponValidationResultDto>>,
        IRequestHandler<CreateCouponCommand, BaseResponse<CouponDto>>,
        IRequestHandler<UpdateCouponCommand, BaseResponse<CouponDto>>,
        IRequestHandler<DeleteCouponCommand, BaseResponse<bool>>
    {
        private readonly IRepository<CouponCode> _couponRepo;
        private readonly IUnitOfWork _unitOfWork;

        public CouponCommandHandler(IRepository<CouponCode> couponRepo, IUnitOfWork unitOfWork)
        {
            _couponRepo = couponRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<List<CouponDto>>> Handle(GetCouponsQuery request, CancellationToken cancellationToken)
        {
            var coupons = await _couponRepo.Query()
                .OrderByDescending(c => c.CreatedDate)
                .Select(c => MapToDto(c))
                .ToListAsync(cancellationToken);

            return BaseResponse<List<CouponDto>>.Ok(coupons, "Coupons retrieved successfully");
        }

        public async Task<BaseResponse<CouponValidationResultDto>> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BaseResponse<CouponValidationResultDto>.Fail("Please enter a valid coupon code.");
            }

            var cleanCode = request.Code.Trim().ToUpper();
            var coupon = await _couponRepo.Query()
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == cleanCode, cancellationToken);

            if (coupon == null)
            {
                return BaseResponse<CouponValidationResultDto>.Fail($"Coupon code '{cleanCode}' is invalid or does not exist.");
            }

            if (!coupon.IsActive)
            {
                return BaseResponse<CouponValidationResultDto>.Fail($"Coupon code '{cleanCode}' is currently disabled.");
            }

            if (coupon.ExpiryDate < DateTimeOffset.UtcNow)
            {
                return BaseResponse<CouponValidationResultDto>.Fail($"Coupon code '{cleanCode}' expired on {coupon.ExpiryDate:dd MMM yyyy}.");
            }

            if (coupon.MinPurchaseAmount > 0 && request.PurchaseAmount < coupon.MinPurchaseAmount)
            {
                return BaseResponse<CouponValidationResultDto>.Fail($"Coupon code '{cleanCode}' requires a minimum purchase amount of ₹{coupon.MinPurchaseAmount:N2}.");
            }

            var result = new CouponValidationResultDto
            {
                IsValid = true,
                Code = coupon.Code,
                DiscountPercentage = coupon.DiscountPercentage,
                MinPurchaseAmount = coupon.MinPurchaseAmount,
                Message = $"Coupon '{coupon.Code}' applied successfully! ({coupon.DiscountPercentage}% OFF)"
            };

            return BaseResponse<CouponValidationResultDto>.Ok(result, result.Message);
        }

        public async Task<BaseResponse<CouponDto>> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Request.Code))
                return BaseResponse<CouponDto>.Fail("Coupon code is required");

            var cleanCode = request.Request.Code.Trim().ToUpper();
            var exists = await _couponRepo.Query().AnyAsync(c => c.Code.ToUpper() == cleanCode, cancellationToken);
            if (exists)
                return BaseResponse<CouponDto>.Fail($"Coupon code '{cleanCode}' already exists");

            var coupon = new CouponCode
            {
                Code = cleanCode,
                DiscountPercentage = request.Request.DiscountPercentage,
                ExpiryDate = request.Request.ExpiryDate == default ? DateTimeOffset.UtcNow.AddDays(30) : request.Request.ExpiryDate,
                MinPurchaseAmount = request.Request.MinPurchaseAmount,
                IsActive = request.Request.IsActive
            };

            await _couponRepo.AddAsync(coupon, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<CouponDto>.Ok(MapToDto(coupon), "Coupon code created successfully");
        }

        public async Task<BaseResponse<CouponDto>> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
        {
            var coupon = await _couponRepo.GetByIdAsync(request.Id, cancellationToken);
            if (coupon == null)
                return BaseResponse<CouponDto>.Fail("Coupon code not found");

            if (!string.IsNullOrWhiteSpace(request.Request.Code))
            {
                var cleanCode = request.Request.Code.Trim().ToUpper();
                var duplicate = await _couponRepo.Query()
                    .AnyAsync(c => c.Id != request.Id && c.Code.ToUpper() == cleanCode, cancellationToken);
                if (duplicate)
                    return BaseResponse<CouponDto>.Fail($"Another coupon with code '{cleanCode}' already exists");

                coupon.Code = cleanCode;
            }

            coupon.DiscountPercentage = request.Request.DiscountPercentage;
            coupon.ExpiryDate = request.Request.ExpiryDate;
            coupon.MinPurchaseAmount = request.Request.MinPurchaseAmount;
            coupon.IsActive = request.Request.IsActive;
            coupon.UpdatedDate = DateTimeOffset.UtcNow;

            _couponRepo.Update(coupon);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<CouponDto>.Ok(MapToDto(coupon), "Coupon code updated successfully");
        }

        public async Task<BaseResponse<bool>> Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
        {
            var coupon = await _couponRepo.GetByIdAsync(request.Id, cancellationToken);
            if (coupon == null)
                return BaseResponse<bool>.Fail("Coupon code not found");

            coupon.IsDeleted = true;
            coupon.DeletedDate = DateTimeOffset.UtcNow;

            _couponRepo.Update(coupon);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Coupon code deleted successfully");
        }

        private static CouponDto MapToDto(CouponCode c) => new CouponDto
        {
            Id = c.Id,
            Code = c.Code,
            DiscountPercentage = c.DiscountPercentage,
            ExpiryDate = c.ExpiryDate,
            MinPurchaseAmount = c.MinPurchaseAmount,
            IsActive = c.IsActive,
            CreatedDate = c.CreatedDate
        };
    }
}
