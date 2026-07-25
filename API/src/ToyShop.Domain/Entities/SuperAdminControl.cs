using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class SuperAdminControl : BaseEntity
    {
        public bool IsShopSettingsMenuEnabled { get; set; } = true;
        public bool IsAppControlMenuEnabled { get; set; } = true;
        public bool IsWhatsAppFloatingWidgetEnabled { get; set; } = true;
    }
}
