using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Application.DTOs;
using ToyShop.Domain.Entities;
using ToyShop.Shared.Models;

namespace ToyShop.Application.Features.Shop
{
    // Queries
    public record GetShopQuery : IRequest<BaseResponse<ShopDto>>;

    // Commands
    public record UpdateShopCommand(UpdateShopRequest Request) : IRequest<BaseResponse<ShopDto>>;

    // Handlers
    public class ShopQueryHandler : IRequestHandler<GetShopQuery, BaseResponse<ShopDto>>
    {
        private readonly IRepository<Domain.Entities.Shop> _shopRepository;

        public ShopQueryHandler(IRepository<Domain.Entities.Shop> shopRepository)
        {
            _shopRepository = shopRepository;
        }

        public async Task<BaseResponse<ShopDto>> Handle(GetShopQuery request, CancellationToken cancellationToken)
        {
            var shop = await _shopRepository.Query().FirstOrDefaultAsync(cancellationToken);
            if (shop == null)
            {
                // Fallback default
                shop = new Domain.Entities.Shop
                {
                    ShopName = "ToyShop Wonderland",
                    Motto = "Bringing Smiles & Pure Joy to Every Kid!",
                    Email1 = "contact@toyshop.com",
                    Phone1 = "+91 98765 43210",
                    City = "Kochi",
                    Country = "India"
                };
            }

            return BaseResponse<ShopDto>.Ok(MapToDto(shop), "Shop details retrieved successfully");
        }

        public static ShopDto MapToDto(Domain.Entities.Shop s) => new ShopDto
        {
            Id = s.Id,
            ShopName = s.ShopName,
            Motto = s.Motto,
            LogoUrl = s.LogoUrl,
            FaviconUrl = s.FaviconUrl,
            Email1 = s.Email1,
            Email2 = s.Email2,
            Phone1 = s.Phone1,
            Phone2 = s.Phone2,
            Phone3 = s.Phone3,
            WhatsAppNumber = s.WhatsAppNumber,
            AddressLine1 = s.AddressLine1,
            AddressLine2 = s.AddressLine2,
            City = s.City,
            State = s.State,
            Pincode = s.Pincode,
            Country = s.Country,
            GstNo = s.GstNo,
            RegNo = s.RegNo,
            PanNo = s.PanNo,
            FacebookUrl = s.FacebookUrl,
            InstagramUrl = s.InstagramUrl,
            TwitterUrl = s.TwitterUrl,
            YouTubeUrl = s.YouTubeUrl,
            OpeningHours = s.OpeningHours,
            HeroTitle = s.HeroTitle,
            HeroDescription = s.HeroDescription,
            HeroImageUrl1 = s.HeroImageUrl1,
            HeroImageUrl2 = s.HeroImageUrl2,
            HeroImageUrl3 = s.HeroImageUrl3,
            HeroImageUrl4 = s.HeroImageUrl4,
            PromoTitle = s.PromoTitle,
            PromoDescription = s.PromoDescription,
            PromoCouponCode = s.PromoCouponCode
        };
    }

    public class ShopCommandHandler : IRequestHandler<UpdateShopCommand, BaseResponse<ShopDto>>
    {
        private readonly IRepository<Domain.Entities.Shop> _shopRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ShopCommandHandler(IRepository<Domain.Entities.Shop> shopRepository, IUnitOfWork unitOfWork)
        {
            _shopRepository = shopRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<ShopDto>> Handle(UpdateShopCommand request, CancellationToken cancellationToken)
        {
            var req = request.Request;
            var shop = await _shopRepository.Query().FirstOrDefaultAsync(cancellationToken);

            if (shop == null)
            {
                shop = new Domain.Entities.Shop();
                await _shopRepository.AddAsync(shop, cancellationToken);
            }

            shop.ShopName = req.ShopName ?? string.Empty;
            shop.Motto = req.Motto ?? string.Empty;
            shop.LogoUrl = req.LogoUrl ?? string.Empty;
            shop.FaviconUrl = req.FaviconUrl ?? string.Empty;
            shop.Email1 = req.Email1 ?? string.Empty;
            shop.Email2 = req.Email2;
            shop.Phone1 = req.Phone1 ?? string.Empty;
            shop.Phone2 = req.Phone2;
            shop.Phone3 = req.Phone3;
            shop.WhatsAppNumber = req.WhatsAppNumber;
            shop.AddressLine1 = req.AddressLine1 ?? string.Empty;
            shop.AddressLine2 = req.AddressLine2;
            shop.City = req.City ?? string.Empty;
            shop.State = req.State ?? string.Empty;
            shop.Pincode = req.Pincode ?? string.Empty;
            shop.Country = req.Country ?? "India";
            shop.GstNo = req.GstNo;
            shop.RegNo = req.RegNo;
            shop.PanNo = req.PanNo;
            shop.FacebookUrl = req.FacebookUrl;
            shop.InstagramUrl = req.InstagramUrl;
            shop.TwitterUrl = req.TwitterUrl;
            shop.YouTubeUrl = req.YouTubeUrl;
            shop.OpeningHours = req.OpeningHours;
            shop.HeroTitle = req.HeroTitle;
            shop.HeroDescription = req.HeroDescription;
            shop.HeroImageUrl1 = req.HeroImageUrl1;
            shop.HeroImageUrl2 = req.HeroImageUrl2;
            shop.HeroImageUrl3 = req.HeroImageUrl3;
            shop.HeroImageUrl4 = req.HeroImageUrl4;
            shop.PromoTitle = req.PromoTitle;
            shop.PromoDescription = req.PromoDescription;
            shop.PromoCouponCode = req.PromoCouponCode;
            shop.UpdatedDate = DateTimeOffset.UtcNow;

            if (shop.Id > 0)
            {
                _shopRepository.Update(shop);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<ShopDto>.Ok(ShopQueryHandler.MapToDto(shop), "Shop details updated successfully");
        }
    }
}
