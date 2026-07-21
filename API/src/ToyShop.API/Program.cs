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

              SELECT setval('""Categories_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Categories""), 1));
              SELECT setval('""Products_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Products""), 1));
              SELECT setval('""ProductImages_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""ProductImages""), 1));
              SELECT setval('""Customers_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Customers""), 1));
              SELECT setval('""Addresses_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Addresses""), 1));
              SELECT setval('""Orders_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Orders""), 1));
              SELECT setval('""OrderItems_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""OrderItems""), 1));
              SELECT setval('""Payments_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Payments""), 1));
              SELECT setval('""Admins_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Admins""), 1));"
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
