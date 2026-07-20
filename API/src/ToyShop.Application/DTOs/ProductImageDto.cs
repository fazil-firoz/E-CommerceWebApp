namespace ToyShop.Application.DTOs
{
    public class ProductImageDto
    {
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public double ZoomScale { get; set; } = 1.0;
    }
}
