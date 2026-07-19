using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class UploadController : BaseApiController
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IImageProcessor _imageProcessor;

        private const long MaxFileSizeInBytes = 5 * 1024 * 1024; // 5 MB
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

        public UploadController(IWebHostEnvironment webHostEnvironment, IImageProcessor imageProcessor)
        {
            _webHostEnvironment = webHostEnvironment;
            _imageProcessor = imageProcessor;
        }

        /// <summary>
        /// Upload product images, resizes them (large, medium, thumb) and converts them to WebP.
        /// POST /api/upload/products
        /// </summary>
        [HttpPost("products")]
        public async Task<ActionResult<BaseResponse<List<string>>>> UploadProductImages(
            [FromForm] List<IFormFile> files, 
            CancellationToken cancellationToken)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(BaseResponse<List<string>>.Fail("No files uploaded."));
            }

            // 1. Validate total images count limit (Max 4 images per product)
            if (files.Count > 4)
            {
                return BadRequest(BaseResponse<List<string>>.Fail("Maximum 4 images can be uploaded per product."));
            }

            // 2. Validate individual files (size and extension)
            foreach (var file in files)
            {
                if (file.Length > MaxFileSizeInBytes)
                {
                    return BadRequest(BaseResponse<List<string>>.Fail($"Image '{file.FileName}' exceeds the 5 MB size limit."));
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest(BaseResponse<List<string>>.Fail($"Format of '{file.FileName}' is not allowed. Only JPG, JPEG, PNG, WEBP are supported."));
                }
            }

            // 3. Process and save images
            var uploadDir = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "products");
            var relativePaths = new List<string>();

            try
            {
                foreach (var file in files)
                {
                    var baseFileName = Guid.NewGuid().ToString("N");
                    using var stream = file.OpenReadStream();
                    
                    var relativePath = await _imageProcessor.ProcessAndSaveImageAsync(
                        stream, 
                        uploadDir, 
                        baseFileName, 
                        cancellationToken);

                    relativePaths.Add(relativePath);
                }

                return Ok(BaseResponse<List<string>>.Ok(relativePaths, "Images processed and uploaded successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, BaseResponse<List<string>>.Fail($"An error occurred while processing images: {ex.Message}"));
            }
        }
    }
}
