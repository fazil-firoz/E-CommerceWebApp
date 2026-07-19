using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ToyShop.Application.Common;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Infrastructure.Persistence;
using ToyShop.Infrastructure.Repositories;
using ToyShop.Infrastructure.Services;

namespace ToyShop.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            services.AddHttpClient<IRazorpayService, RazorpayService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();

            // Email OTP services
            services.AddScoped<IEmailService, EmailService>();
            services.AddSingleton<OtpStore>(); // Singleton so OTPs persist across requests

            // Image processing service
            services.AddScoped<IImageProcessor, ImageProcessor>();

            return services;
        }
    }
}

