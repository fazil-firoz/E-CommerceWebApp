using MediatR;
using Microsoft.EntityFrameworkCore;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Shared.Models;
using ToyShop.Application.DTOs;
using ToyShop.Domain.Entities;

namespace ToyShop.Application.Features.ShopThemes
{
    public record GetActiveThemeQuery : IRequest<BaseResponse<ShopThemeDto>>;
    public record GetAllThemesQuery : IRequest<BaseResponse<List<ShopThemeDto>>>;
    public record SelectActiveThemeCommand(int ThemeId) : IRequest<BaseResponse<ShopThemeDto>>;
    public record UpdateShopThemeCommand(int ThemeId, UpdateShopThemeRequest Request) : IRequest<BaseResponse<ShopThemeDto>>;

    public class ShopThemeQueryHandler :
        IRequestHandler<GetActiveThemeQuery, BaseResponse<ShopThemeDto>>,
        IRequestHandler<GetAllThemesQuery, BaseResponse<List<ShopThemeDto>>>
    {
        private readonly IRepository<ShopTheme> _themeRepo;
        private readonly IUnitOfWork _unitOfWork;

        public ShopThemeQueryHandler(IRepository<ShopTheme> themeRepo, IUnitOfWork unitOfWork)
        {
            _themeRepo = themeRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<ShopThemeDto>> Handle(GetActiveThemeQuery request, CancellationToken cancellationToken)
        {
            await SeedDefaultThemesIfEmpty(cancellationToken);
            var activeTheme = await _themeRepo.Query().FirstOrDefaultAsync(t => t.IsActive, cancellationToken);
            if (activeTheme == null)
            {
                activeTheme = await _themeRepo.Query().FirstOrDefaultAsync(cancellationToken);
            }

            if (activeTheme == null)
            {
                return BaseResponse<ShopThemeDto>.Ok(new ShopThemeDto
                {
                    Id = 1,
                    ThemeName = "Default Store Theme (Original)",
                    ThemeKey = "default",
                    PrimaryColor = "#1890ff",
                    SecondaryColor = "#722ed1",
                    BackgroundColor = "#f5f7fa",
                    AccentColor = "#ff4d4f",
                    HeaderBgColor = "#ffffff",
                    HeroBgGradient = "linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eff6ff 100%)",
                    CardBgColor = "#ffffff",
                    TextColor = "#0f172a",
                    IsActive = true
                });
            }

            return BaseResponse<ShopThemeDto>.Ok(MapToDto(activeTheme));
        }

        public async Task<BaseResponse<List<ShopThemeDto>>> Handle(GetAllThemesQuery request, CancellationToken cancellationToken)
        {
            await SeedDefaultThemesIfEmpty(cancellationToken);
            var list = await _themeRepo.Query().OrderBy(t => t.Id).ToListAsync(cancellationToken);
            var dtos = list.Select(MapToDto).ToList();
            return BaseResponse<List<ShopThemeDto>>.Ok(dtos);
        }

        private async Task SeedDefaultThemesIfEmpty(CancellationToken cancellationToken)
        {
            var count = await _themeRepo.Query().CountAsync(cancellationToken);
            if (count == 0)
            {
                var defaults = new List<ShopTheme>
                {
                    new ShopTheme
                    {
                        ThemeName = "Default Store Theme (Original)",
                        ThemeKey = "default",
                        PrimaryColor = "#1890ff",
                        SecondaryColor = "#722ed1",
                        BackgroundColor = "#f5f7fa",
                        AccentColor = "#ff4d4f",
                        HeaderBgColor = "#ffffff",
                        HeroBgGradient = "linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eff6ff 100%)",
                        CardBgColor = "#ffffff",
                        TextColor = "#0f172a",
                        IsActive = true
                    },
                    new ShopTheme
                    {
                        ThemeName = "Kawaii Cute Pink Store",
                        ThemeKey = "kawaii",
                        PrimaryColor = "#ff6584",
                        SecondaryColor = "#ff85c0",
                        BackgroundColor = "#fff5f7",
                        AccentColor = "#ff2a6d",
                        HeaderBgColor = "#ffffff",
                        HeroBgGradient = "linear-gradient(135deg, #ffffff 0%, #fff0f5 45%, #ffe4e6 100%)",
                        CardBgColor = "#ffffff",
                        TextColor = "#2d3748",
                        IsActive = false
                    },
                    new ShopTheme
                    {
                        ThemeName = "Fancy Dress & Fashion Boutique",
                        ThemeKey = "fancy_dress",
                        PrimaryColor = "#d47a8d",
                        SecondaryColor = "#e8b4b8",
                        BackgroundColor = "#fdfbf7",
                        AccentColor = "#9b2c2c",
                        HeaderBgColor = "#ffffff",
                        HeroBgGradient = "linear-gradient(135deg, #ffffff 0%, #fdfbf7 50%, #f7fee7 100%)",
                        CardBgColor = "#ffffff",
                        TextColor = "#2c1810",
                        IsActive = false
                    },
                    new ShopTheme
                    {
                        ThemeName = "Luxe Emerald & Gold Store",
                        ThemeKey = "luxe_emerald",
                        PrimaryColor = "#059669",
                        SecondaryColor = "#10b981",
                        BackgroundColor = "#f0fdf4",
                        AccentColor = "#d97706",
                        HeaderBgColor = "#ffffff",
                        HeroBgGradient = "linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #dcfce7 100%)",
                        CardBgColor = "#ffffff",
                        TextColor = "#064e3b",
                        IsActive = false
                    }
                };

                foreach (var item in defaults)
                {
                    await _themeRepo.AddAsync(item, cancellationToken);
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        public static ShopThemeDto MapToDto(ShopTheme t) => new ShopThemeDto
        {
            Id = t.Id,
            ThemeName = t.ThemeName,
            ThemeKey = t.ThemeKey,
            PrimaryColor = t.PrimaryColor,
            SecondaryColor = t.SecondaryColor,
            BackgroundColor = t.BackgroundColor,
            AccentColor = t.AccentColor,
            HeaderBgColor = t.HeaderBgColor,
            HeroBgGradient = t.HeroBgGradient,
            CardBgColor = t.CardBgColor,
            TextColor = t.TextColor,
            IsActive = t.IsActive
        };
    }

    public class ShopThemeCommandHandler :
        IRequestHandler<SelectActiveThemeCommand, BaseResponse<ShopThemeDto>>,
        IRequestHandler<UpdateShopThemeCommand, BaseResponse<ShopThemeDto>>
    {
        private readonly IRepository<ShopTheme> _themeRepo;
        private readonly IUnitOfWork _unitOfWork;

        public ShopThemeCommandHandler(IRepository<ShopTheme> themeRepo, IUnitOfWork unitOfWork)
        {
            _themeRepo = themeRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<ShopThemeDto>> Handle(SelectActiveThemeCommand request, CancellationToken cancellationToken)
        {
            var allThemes = await _themeRepo.Query().ToListAsync(cancellationToken);
            var targetTheme = allThemes.FirstOrDefault(t => t.Id == request.ThemeId);

            if (targetTheme == null)
            {
                return BaseResponse<ShopThemeDto>.Fail("Selected theme not found");
            }

            foreach (var t in allThemes)
            {
                t.IsActive = (t.Id == request.ThemeId);
                _themeRepo.Update(t);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return BaseResponse<ShopThemeDto>.Ok(ShopThemeQueryHandler.MapToDto(targetTheme), $"Activated theme: {targetTheme.ThemeName}");
        }

        public async Task<BaseResponse<ShopThemeDto>> Handle(UpdateShopThemeCommand request, CancellationToken cancellationToken)
        {
            var theme = await _themeRepo.GetByIdAsync(request.ThemeId, cancellationToken);
            if (theme == null)
            {
                return BaseResponse<ShopThemeDto>.Fail("Theme not found");
            }

            var req = request.Request;
            if (!string.IsNullOrWhiteSpace(req.ThemeName)) theme.ThemeName = req.ThemeName;
            if (!string.IsNullOrWhiteSpace(req.PrimaryColor)) theme.PrimaryColor = req.PrimaryColor;
            if (!string.IsNullOrWhiteSpace(req.SecondaryColor)) theme.SecondaryColor = req.SecondaryColor;
            if (!string.IsNullOrWhiteSpace(req.BackgroundColor)) theme.BackgroundColor = req.BackgroundColor;
            if (!string.IsNullOrWhiteSpace(req.AccentColor)) theme.AccentColor = req.AccentColor;
            if (!string.IsNullOrWhiteSpace(req.HeaderBgColor)) theme.HeaderBgColor = req.HeaderBgColor;
            if (!string.IsNullOrWhiteSpace(req.HeroBgGradient)) theme.HeroBgGradient = req.HeroBgGradient;
            if (!string.IsNullOrWhiteSpace(req.CardBgColor)) theme.CardBgColor = req.CardBgColor;
            if (!string.IsNullOrWhiteSpace(req.TextColor)) theme.TextColor = req.TextColor;

            _themeRepo.Update(theme);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<ShopThemeDto>.Ok(ShopThemeQueryHandler.MapToDto(theme), "Theme colors updated successfully");
        }
    }
}
