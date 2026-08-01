using ToyShop.Domain.Common;

namespace ToyShop.Domain.Entities
{
    public class Admin : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
    }
}
