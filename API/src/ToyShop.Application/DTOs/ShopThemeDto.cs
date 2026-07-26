namespace ToyShop.Application.DTOs
{
    public class ShopThemeDto
    {
        public int Id { get; set; }
        public string ThemeName { get; set; } = string.Empty;
        public string ThemeKey { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = string.Empty;
        public string SecondaryColor { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public string AccentColor { get; set; } = string.Empty;
        public string HeaderBgColor { get; set; } = string.Empty;
        public string HeroBgGradient { get; set; } = string.Empty;
        public string CardBgColor { get; set; } = string.Empty;
        public string TextColor { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class UpdateShopThemeRequest
    {
        public string ThemeName { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = string.Empty;
        public string SecondaryColor { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public string AccentColor { get; set; } = string.Empty;
        public string HeaderBgColor { get; set; } = string.Empty;
        public string HeroBgGradient { get; set; } = string.Empty;
        public string CardBgColor { get; set; } = string.Empty;
        public string TextColor { get; set; } = string.Empty;
    }
}
