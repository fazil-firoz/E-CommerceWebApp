using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using ToyShop.Application.Common.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Size = SixLabors.ImageSharp.Size;

namespace ToyShop.Infrastructure.Services
{
    public class ImageProcessor : IImageProcessor
    {
        private readonly Cloudinary? _cloudinary;

        public ImageProcessor(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"] 
                ?? configuration["CLOUDINARY_CLOUD_NAME"] 
                ?? configuration["Cloudinary__CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"] 
                ?? configuration["CLOUDINARY_API_KEY"] 
                ?? configuration["Cloudinary__ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"] 
                ?? configuration["CLOUDINARY_API_SECRET"] 
                ?? configuration["Cloudinary__ApiSecret"];

            if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
            {
                var cloudinaryUrl = configuration["CLOUDINARY_URL"];
                if (!string.IsNullOrWhiteSpace(cloudinaryUrl))
                {
                    _cloudinary = new Cloudinary(cloudinaryUrl);
                    return;
                }
            }

            if (!string.IsNullOrWhiteSpace(cloudName) &&
                !string.IsNullOrWhiteSpace(apiKey) &&
                !string.IsNullOrWhiteSpace(apiSecret))
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(account);
            }
        }

        public async Task<string> ProcessAndSaveImageAsync(
            Stream imageStream, 
            string targetDirectory, 
            string baseFileName, 
            CancellationToken cancellationToken = default)
        {
            if (imageStream.CanSeek)
            {
                imageStream.Position = 0;
            }

            // 1. If Cloudinary is configured, upload directly to Cloudinary CDN
            if (_cloudinary != null)
            {
                try
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(baseFileName, imageStream),
                        Folder = "products",
                        PublicId = baseFileName,
                        Overwrite = true
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
                    if (uploadResult?.SecureUrl != null)
                    {
                        return uploadResult.SecureUrl.ToString();
                    }

                    if (uploadResult?.Error != null)
                    {
                        System.Console.WriteLine($"Cloudinary upload error: {uploadResult.Error.Message}. Falling back to local storage.");
                    }
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine($"Cloudinary upload warning: {ex.Message}. Falling back to local storage.");
                }
            }

            // 2. Fallback: Save locally on disk
            if (!Directory.Exists(targetDirectory))
            {
                Directory.CreateDirectory(targetDirectory);
            }

            var thumbPath = Path.Combine(targetDirectory, $"{baseFileName}_thumb.webp");
            var mediumPath = Path.Combine(targetDirectory, $"{baseFileName}_medium.webp");
            var largePath = Path.Combine(targetDirectory, $"{baseFileName}_large.webp");
            var basePath = Path.Combine(targetDirectory, $"{baseFileName}.webp");

            if (imageStream.CanSeek)
            {
                imageStream.Position = 0;
            }

            using var image = await Image.LoadAsync(imageStream, cancellationToken);
            var webpEncoder = new WebpEncoder { Quality = 95 };

            using (var largeImg = image.Clone(x => x.Resize(new ResizeOptions { Size = new Size(1200, 1200), Mode = ResizeMode.Max })))
            {
                await largeImg.SaveAsWebpAsync(largePath, webpEncoder, cancellationToken);
                await largeImg.SaveAsWebpAsync(basePath, webpEncoder, cancellationToken);
            }

            using (var mediumImg = image.Clone(x => x.Resize(new ResizeOptions { Size = new Size(800, 800), Mode = ResizeMode.Max })))
            {
                await mediumImg.SaveAsWebpAsync(mediumPath, webpEncoder, cancellationToken);
            }

            using (var thumbImg = image.Clone(x => x.Resize(new ResizeOptions { Size = new Size(400, 400), Mode = ResizeMode.Max })))
            {
                await thumbImg.SaveAsWebpAsync(thumbPath, webpEncoder, cancellationToken);
            }

            return $"/uploads/products/{baseFileName}.webp";
        }

        public async Task<string> UploadDirectAsync(
            Stream fileStream,
            string fileName,
            string folder = "general",
            string fallbackTargetDirectory = "",
            CancellationToken cancellationToken = default)
        {
            if (fileStream.CanSeek)
            {
                fileStream.Position = 0;
            }

            // 1. Upload to Cloudinary if configured
            if (_cloudinary != null)
            {
                try
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(fileName, fileStream),
                        Folder = folder,
                        PublicId = $"{Path.GetFileNameWithoutExtension(fileName)}_{Guid.NewGuid():N}"
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
                    if (uploadResult?.SecureUrl != null)
                    {
                        return uploadResult.SecureUrl.ToString();
                    }

                    if (uploadResult?.Error != null)
                    {
                        System.Console.WriteLine($"Cloudinary direct upload error: {uploadResult.Error.Message}. Falling back to local storage.");
                    }
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine($"Cloudinary direct upload warning: {ex.Message}. Falling back to local storage.");
                }
            }

            // 2. Fallback: Save to local directory
            if (fileStream.CanSeek)
            {
                fileStream.Position = 0;
            }

            if (!string.IsNullOrEmpty(fallbackTargetDirectory))
            {
                if (!Directory.Exists(fallbackTargetDirectory))
                {
                    Directory.CreateDirectory(fallbackTargetDirectory);
                }

                var uniqueFileName = $"{Guid.NewGuid():N}{Path.GetExtension(fileName)}";
                var filePath = Path.Combine(fallbackTargetDirectory, uniqueFileName);

                using (var outputStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(outputStream, cancellationToken);
                }

                return $"/uploads/{folder}/{uniqueFileName}";
            }

            return string.Empty;
        }
    }
}
