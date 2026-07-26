using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class ShopTheme : BaseEntity
    {
        public string ThemeName { get; set; } = string.Empty;
        public string ThemeKey { get; set; } = string.Empty; // e.g. "kawaii", "classic_modern", "fashion_boutique"
        public string PrimaryColor { get; set; } = "#ff6584";
        public string SecondaryColor { get; set; } = "#ff85c0";
        public string BackgroundColor { get; set; } = "#fff5f7";
        public string AccentColor { get; set; } = "#ff2a6d";
        public string HeaderBgColor { get; set; } = "#ffffff";
        public string HeroBgGradient { get; set; } = "linear-gradient(135deg, #ffffff 0%, #fff0f5 50%, #ffe4e6 100%)";
        public string CardBgColor { get; set; } = "#ffffff";
        public string TextColor { get; set; } = "#2d3748";
        public bool IsActive { get; set; } = false;
    }
}
