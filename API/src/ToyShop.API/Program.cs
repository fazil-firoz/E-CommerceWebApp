using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ToyShop.Application;
using ToyShop.Infrastructure;
using ToyShop.API.Services;
using ToyShop.Application.Common.Interfaces;
using ToyShop.API.Middlewares;

// Enforce UTC for all Npgsql timestamp operations
// PostgreSQL timestamptz only accepts DateTimeOffset with offset=0 (UTC)
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer 12345abcdef\""
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Register Clean Architecture layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Auditing services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:3000",
                "https://localhost:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure JWT Authentication
var secretKey = builder.Configuration["JwtSettings:Secret"] ?? "ToyShopVerySecretKeyForJWTSignaturesShouldBeLongEnough32Bytes!";
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "ToyShopAPI";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "ToyShopCustomerAdmin";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

var app = builder.Build();

// Automatically run database migrations and sync primary key sequences
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ToyShop.Infrastructure.Persistence.ApplicationDbContext>();
        Microsoft.EntityFrameworkCore.RelationalDatabaseFacadeExtensions.ExecuteSqlRaw(
            context.Database, 
            @"ALTER TABLE ""ProductImages"" ADD COLUMN IF NOT EXISTS ""IsMain"" BOOLEAN NOT NULL DEFAULT FALSE;
              ALTER TABLE ""ProductImages"" ADD COLUMN IF NOT EXISTS ""ZoomScale"" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

              CREATE TABLE IF NOT EXISTS ""Shops"" (
                  ""Id"" SERIAL PRIMARY KEY,
                  ""ShopName"" VARCHAR(255) NOT NULL DEFAULT '',
                  ""Motto"" VARCHAR(500) DEFAULT '',
                  ""LogoUrl"" VARCHAR(500) DEFAULT '',
                  ""FaviconUrl"" VARCHAR(500) DEFAULT '',
                  ""Email1"" VARCHAR(255) DEFAULT '',
                  ""Email2"" VARCHAR(255) DEFAULT '',
                  ""Phone1"" VARCHAR(50) DEFAULT '',
                  ""Phone2"" VARCHAR(50) DEFAULT '',
                  ""Phone3"" VARCHAR(50) DEFAULT '',
                  ""WhatsAppNumber"" VARCHAR(50) DEFAULT '',
                  ""AddressLine1"" VARCHAR(500) DEFAULT '',
                  ""AddressLine2"" VARCHAR(500) DEFAULT '',
                  ""City"" VARCHAR(100) DEFAULT '',
                  ""State"" VARCHAR(100) DEFAULT '',
                  ""Pincode"" VARCHAR(20) DEFAULT '',
                  ""Country"" VARCHAR(100) DEFAULT 'India',
                  ""GstNo"" VARCHAR(100) DEFAULT '',
                  ""RegNo"" VARCHAR(100) DEFAULT '',
                  ""PanNo"" VARCHAR(100) DEFAULT '',
                  ""FacebookUrl"" VARCHAR(500) DEFAULT '',
                  ""InstagramUrl"" VARCHAR(500) DEFAULT '',
                  ""TwitterUrl"" VARCHAR(500) DEFAULT '',
                  ""YouTubeUrl"" VARCHAR(500) DEFAULT '',
                  ""OpeningHours"" VARCHAR(255) DEFAULT '',
                  ""CreatedDate"" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  ""CreatedBy"" VARCHAR(255) DEFAULT 'System',
                  ""UpdatedDate"" TIMESTAMPTZ NULL,
                  ""UpdatedBy"" VARCHAR(255) NULL,
                  ""DeletedDate"" TIMESTAMPTZ NULL,
                  ""DeletedBy"" VARCHAR(255) NULL,
                  ""IsDeleted"" BOOLEAN NOT NULL DEFAULT FALSE
              );

              INSERT INTO ""Shops"" (""Id"", ""ShopName"", ""Motto"", ""LogoUrl"", ""FaviconUrl"", ""Email1"", ""Email2"", ""Phone1"", ""Phone2"", ""Phone3"", ""WhatsAppNumber"", ""AddressLine1"", ""AddressLine2"", ""City"", ""State"", ""Pincode"", ""Country"", ""GstNo"", ""RegNo"", ""PanNo"", ""FacebookUrl"", ""InstagramUrl"", ""TwitterUrl"", ""YouTubeUrl"", ""OpeningHours"", ""CreatedDate"", ""CreatedBy"", ""IsDeleted"")
              SELECT 1, 'ToyShop Wonderland', 'Bringing Smiles & Pure Joy to Every Kid!', '/logo.png', '/favicon.ico', 'contact@toyshop.com', 'support@toyshop.com', '+91 98765 43210', '+91 98765 43211', '+91 80000 11223', '+91 98765 43210', '123 Fun & Games Street', 'Near Central Toy Park, MG Road', 'Kochi', 'Kerala', '682001', 'India', '32ABCDE1234F1Z5', 'REG-TOY-2026-99', 'ABCDE1234F', 'https://facebook.com', 'https://instagram.com', 'https://twitter.com', 'https://youtube.com', 'Mon - Sat: 9:00 AM - 9:00 PM', NOW(), 'System', FALSE
              WHERE NOT EXISTS (SELECT 1 FROM ""Shops"" WHERE ""Id"" = 1);

              CREATE TABLE IF NOT EXISTS ""SuperAdminControls"" (
                  ""Id"" SERIAL PRIMARY KEY,
                  ""IsShopSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""IsShipmentSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""IsInvoiceSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""IsTaxSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""IsReportsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""IsAppControlMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""IsWhatsAppFloatingWidgetEnabled"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""CreatedDate"" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  ""CreatedBy"" VARCHAR(255) DEFAULT 'System',
                  ""UpdatedDate"" TIMESTAMPTZ NULL,
                  ""UpdatedBy"" VARCHAR(255) NULL,
                  ""DeletedDate"" TIMESTAMPTZ NULL,
                  ""DeletedBy"" VARCHAR(255) NULL,
                  ""IsDeleted"" BOOLEAN NOT NULL DEFAULT FALSE
              );

              ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""CouponCode"" VARCHAR(100) NULL;
              ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""DiscountAmount"" NUMERIC NOT NULL DEFAULT 0.0;

              ALTER TABLE ""SuperAdminControls"" ADD COLUMN IF NOT EXISTS ""IsShipmentSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE;
              ALTER TABLE ""SuperAdminControls"" ADD COLUMN IF NOT EXISTS ""IsInvoiceSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE;
              ALTER TABLE ""SuperAdminControls"" ADD COLUMN IF NOT EXISTS ""IsTaxSettingsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE;
              ALTER TABLE ""SuperAdminControls"" ADD COLUMN IF NOT EXISTS ""IsReportsMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE;
              ALTER TABLE ""SuperAdminControls"" ADD COLUMN IF NOT EXISTS ""IsCouponMenuEnabled"" BOOLEAN NOT NULL DEFAULT TRUE;
              ALTER TABLE ""SuperAdminControls"" ADD COLUMN IF NOT EXISTS ""IsPrintInvoiceEnabled"" BOOLEAN NOT NULL DEFAULT TRUE;

              INSERT INTO ""SuperAdminControls"" (""Id"", ""IsShopSettingsMenuEnabled"", ""IsShipmentSettingsMenuEnabled"", ""IsInvoiceSettingsMenuEnabled"", ""IsTaxSettingsMenuEnabled"", ""IsReportsMenuEnabled"", ""IsCouponMenuEnabled"", ""IsAppControlMenuEnabled"", ""IsWhatsAppFloatingWidgetEnabled"", ""CreatedDate"", ""CreatedBy"", ""IsDeleted"")
              SELECT 1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), 'System', FALSE
              WHERE NOT EXISTS (SELECT 1 FROM ""SuperAdminControls"" WHERE ""Id"" = 1);

              CREATE TABLE IF NOT EXISTS ""CouponCodes"" (
                  ""Id"" SERIAL PRIMARY KEY,
                  ""Code"" VARCHAR(100) NOT NULL,
                  ""DiscountPercentage"" NUMERIC NOT NULL DEFAULT 0.0,
                  ""ExpiryDate"" TIMESTAMPTZ NOT NULL,
                  ""MinPurchaseAmount"" NUMERIC NOT NULL DEFAULT 0.0,
                  ""IsActive"" BOOLEAN NOT NULL DEFAULT TRUE,
                  ""CreatedDate"" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  ""CreatedBy"" VARCHAR(255) DEFAULT 'System',
                  ""UpdatedDate"" TIMESTAMPTZ NULL,
                  ""UpdatedBy"" VARCHAR(255) NULL,
                  ""DeletedDate"" TIMESTAMPTZ NULL,
                  ""DeletedBy"" VARCHAR(255) NULL,
                  ""IsDeleted"" BOOLEAN NOT NULL DEFAULT FALSE
              );

              INSERT INTO ""CouponCodes"" (""Code"", ""DiscountPercentage"", ""ExpiryDate"", ""MinPurchaseAmount"", ""IsActive"", ""CreatedDate"", ""CreatedBy"", ""IsDeleted"")
              SELECT 'TOYSHOP10', 10, NOW() + INTERVAL '30 days', 500, TRUE, NOW(), 'System', FALSE
              WHERE NOT EXISTS (SELECT 1 FROM ""CouponCodes"" WHERE ""Code"" = 'TOYSHOP10');

              SELECT setval('""Categories_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Categories""), 1));
              SELECT setval('""Products_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Products""), 1));
              SELECT setval('""ProductImages_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""ProductImages""), 1));
              SELECT setval('""Customers_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Customers""), 1));
              SELECT setval('""Addresses_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Addresses""), 1));
              SELECT setval('""Orders_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Orders""), 1));
              SELECT setval('""OrderItems_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""OrderItems""), 1));
              SELECT setval('""Payments_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Payments""), 1));
              SELECT setval('""Admins_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Admins""), 1));
              SELECT setval('""Shops_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Shops""), 1));
              SELECT setval('""SuperAdminControls_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""SuperAdminControls""), 1));
              SELECT setval('""CouponCodes_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""CouponCodes""), 1));"
        );
    }
    catch (System.Exception ex)
    {
        System.Console.WriteLine($"Database migration error: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
// Always show Swagger for easy API testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToyShop API V1");
    c.RoutePrefix = "swagger";
});

// Redirect root URL to Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("CorsPolicy");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
