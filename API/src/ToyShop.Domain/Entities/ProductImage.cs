using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class ProductImage : BaseEntity
    {
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        public Product? Product { get; set; }
    }
}
