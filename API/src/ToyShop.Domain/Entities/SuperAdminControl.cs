using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class SuperAdminControl : BaseEntity
    {
        public bool IsShopSettingsMenuEnabled { get; set; } = true;
        public bool IsUIControlMenuEnabled { get; set; } = true;
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

        // Homepage Section UI Controls
        public bool IsHeroBannerEnabled { get; set; } = true;
        public bool IsCategoriesSectionEnabled { get; set; } = true;
        public bool IsFeaturedProductsEnabled { get; set; } = true;
        public bool IsNewArrivalsEnabled { get; set; } = true;
        public bool IsBestSellersEnabled { get; set; } = true;
        public bool IsPromoBannerEnabled { get; set; } = true;
        public bool IsWhyChooseUsEnabled { get; set; } = true;
        public bool IsMarqueeEnabled { get; set; } = true;
    }
}
