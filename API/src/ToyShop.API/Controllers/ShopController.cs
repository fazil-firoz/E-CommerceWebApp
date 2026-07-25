using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Shop;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class ShopController : BaseApiController
    {
        private readonly IWebHostEnvironment _environment;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public ShopController(IWebHostEnvironment environment, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        /// <summary>
        /// Public endpoint to fetch shop branding, contact info, and address
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<BaseResponse<ShopDto>>> Get()
        {
            return Ok(await Mediator.Send(new GetShopQuery()));
        }

        /// <summary>
        /// Public endpoint for customers to submit contact messages sent via SMTP
        /// </summary>
        [HttpPost("contact-us")]
        [AllowAnonymous]
        public async Task<ActionResult<BaseResponse<bool>>> SendContactMessage([FromBody] ContactMessageRequest request, [FromServices] IEmailService emailService)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(BaseResponse<bool>.Fail("Name and Message are required"));
            }

            try
            {
                await emailService.SendContactMessageAsync(
                    request.Name.Trim(),
                    request.Phone?.Trim() ?? "",
                    request.Email?.Trim() ?? "",
                    request.Subject?.Trim() ?? "Website Contact Form",
                    request.Message.Trim()
                );

                return Ok(BaseResponse<bool>.Ok(true, "Thank you! Your message has been sent successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(BaseResponse<bool>.Fail($"Failed to send message: {ex.Message}"));
            }
        }

        /// <summary>
        /// Admin endpoint to update shop details
        /// </summary>
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<ShopDto>>> Update([FromBody] UpdateShopRequest request)
        {
            var result = await Mediator.Send(new UpdateShopCommand(request));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Verify Super Admin credentials from appsettings.json
        /// </summary>
        [HttpPost("verify-super-admin")]
        [Authorize(Roles = "Admin")]
        public ActionResult<BaseResponse<bool>> VerifySuperAdmin([FromBody] SuperAdminVerifyRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(BaseResponse<bool>.Fail("Username and Password are required"));
            }

            var configuredUsername = _configuration["SuperAdminSettings:Username"] ?? "superadmin";
            var configuredPassword = _configuration["SuperAdminSettings:Password"] ?? "superadmin@firoz";

            if (request.Username.Trim() == configuredUsername && request.Password == configuredPassword)
            {
                return Ok(BaseResponse<bool>.Ok(true, "Super Admin access granted"));
            }

            return BadRequest(BaseResponse<bool>.Fail("Invalid Super Admin credentials"));
        }

        /// <summary>
        /// Upload shop logo or favicon into wwwroot/uploads/shopdata
        /// </summary>
        [HttpPost("upload-logo")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<BaseResponse<string>>> UploadLogo([FromForm] ShopLogoUploadRequest request)
        {
            var file = request?.File;
            if (file == null || file.Length == 0)
            {
                return BadRequest(BaseResponse<string>.Fail("No image file uploaded"));
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".ico", ".svg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (Array.IndexOf(allowedExtensions, extension) < 0)
                return BadRequest(BaseResponse<string>.Fail("Invalid image format. Allowed: JPG, PNG, WebP, SVG, ICO"));

            // Create target folder wwwroot/uploads/shopdata
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "shopdata");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/shopdata/{uniqueFileName}";
            return Ok(BaseResponse<string>.Ok(relativePath, "Logo uploaded successfully"));
        }
    }

    /// <summary>
    /// Request model for Contact Us form
    /// </summary>
    public class ContactMessageRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request model for shop logo / favicon upload endpoint
    /// </summary>
    public class ShopLogoUploadRequest
    {
        public IFormFile File { get; set; } = null!;
    }

    /// <summary>
    /// Request model for Super Admin verification
    /// </summary>
    public class SuperAdminVerifyRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
