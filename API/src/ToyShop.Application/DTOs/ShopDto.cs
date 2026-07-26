namespace ToyShop.Application.DTOs
{
    public class ShopDto
    {
        public int Id { get; set; }
        public string ShopName { get; set; } = string.Empty;
        public string Motto { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string FaviconUrl { get; set; } = string.Empty;

        // Contact Information
        public string Email1 { get; set; } = string.Empty;
        public string? Email2 { get; set; }
        public string Phone1 { get; set; } = string.Empty;
        public string? Phone2 { get; set; }
        public string? Phone3 { get; set; }
        public string? WhatsAppNumber { get; set; }

        // Address Details
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public string Country { get; set; } = "India";

        // Tax & Legal Details
        public string? GstNo { get; set; }
        public string? RegNo { get; set; }
        public string? PanNo { get; set; }

        // Social Links & Business Info
        public string? FacebookUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? YouTubeUrl { get; set; }
        public string? OpeningHours { get; set; }

        public string? HeroTitle { get; set; }
        public string? HeroDescription { get; set; }
        public string? HeroImageUrl1 { get; set; }
        public string? HeroImageUrl2 { get; set; }
        public string? HeroImageUrl3 { get; set; }
        public string? HeroImageUrl4 { get; set; }
        public string? PromoTitle { get; set; }
        public string? PromoDescription { get; set; }
        public string? PromoCouponCode { get; set; }
    }

    public class UpdateShopRequest
    {
        public string ShopName { get; set; } = string.Empty;
        public string Motto { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string FaviconUrl { get; set; } = string.Empty;

        public string Email1 { get; set; } = string.Empty;
        public string? Email2 { get; set; }
        public string Phone1 { get; set; } = string.Empty;
        public string? Phone2 { get; set; }
        public string? Phone3 { get; set; }
        public string? WhatsAppNumber { get; set; }

        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public string Country { get; set; } = "India";

        public string? GstNo { get; set; }
        public string? RegNo { get; set; }
        public string? PanNo { get; set; }

        public string? FacebookUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? YouTubeUrl { get; set; }
        public string? OpeningHours { get; set; }

        public string? HeroTitle { get; set; }
        public string? HeroDescription { get; set; }
        public string? HeroImageUrl1 { get; set; }
        public string? HeroImageUrl2 { get; set; }
        public string? HeroImageUrl3 { get; set; }
        public string? HeroImageUrl4 { get; set; }
        public string? PromoTitle { get; set; }
        public string? PromoDescription { get; set; }
        public string? PromoCouponCode { get; set; }
    }
}
