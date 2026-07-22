using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class ShipmentMethod : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Fee { get; set; }
        public decimal FreeShippingThreshold { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;
        public int DisplayOrder { get; set; } = 1;
    }
}
