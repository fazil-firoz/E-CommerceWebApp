namespace ToyShop.Application.DTOs
{
    public class ShipmentMethodDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Fee { get; set; }
        public decimal FreeShippingThreshold { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdateShipmentMethodRequest
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Fee { get; set; }
        public decimal FreeShippingThreshold { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
    }
}
