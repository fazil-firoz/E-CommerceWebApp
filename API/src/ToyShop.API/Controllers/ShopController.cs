using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Shop;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class ShopController : BaseApiController
    {
        private readonly IWebHostEnvironment _environment;

        public ShopController(IWebHostEnvironment environment)
        {
            _environment = environment;
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
    /// Request model for shop logo / favicon upload endpoint
    /// </summary>
    public class ShopLogoUploadRequest
    {
        public IFormFile File { get; set; } = null!;
    }
}
