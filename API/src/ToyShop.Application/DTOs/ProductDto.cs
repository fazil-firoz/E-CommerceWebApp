using System.Collections.Generic;

namespace ToyShop.Application.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal Mrp { get; set; }
        public int StockQuantity { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? BadgeLabel { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
        public List<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
    }
}
