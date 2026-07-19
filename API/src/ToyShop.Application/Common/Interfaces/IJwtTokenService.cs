using ToyShop.Domain.Entities;

namespace ToyShop.Application.Common.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(Admin admin);
    }
}
