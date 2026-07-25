using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class SuperAdminControl : BaseEntity
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
    }
}
