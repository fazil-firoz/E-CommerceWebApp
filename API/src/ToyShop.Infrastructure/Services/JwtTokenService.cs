using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Domain.Entities;

namespace ToyShop.Infrastructure.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(Admin admin)
        {
            var secretKey = _configuration["JwtSettings:Secret"] ?? "ToyShopVerySecretKeyForJWTSignaturesShouldBeLongEnough32Bytes!";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "ToyShopAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "ToyShopCustomerAdmin";
            var expiryDays = double.TryParse(_configuration["JwtSettings:ExpiryDays"], out var days) ? days : 7;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Name, admin.Username),
                new Claim(ClaimTypes.GivenName, admin.FullName),
                new Claim(ClaimTypes.Role, "Admin")
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expiryDays),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
