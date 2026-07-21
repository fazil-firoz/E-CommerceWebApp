using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class ProductImage : BaseEntity
    {
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; } = false;
        public double ZoomScale { get; set; } = 1.0;

        public Product? Product { get; set; }
    }
}
