using System.IO;
using System.Threading;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using ToyShop.Application.Common.Interfaces;

namespace ToyShop.Infrastructure.Services
{
    public class ImageProcessor : IImageProcessor
    {
        public async Task<string> ProcessAndSaveImageAsync(
            Stream imageStream, 
            string targetDirectory, 
            string baseFileName, 
            CancellationToken cancellationToken = default)
        {
            // Ensure target directory exists
            if (!Directory.Exists(targetDirectory))
            {
                Directory.CreateDirectory(targetDirectory);
            }

            // Define output paths
            var thumbPath = Path.Combine(targetDirectory, $"{baseFileName}_thumb.webp");
            var mediumPath = Path.Combine(targetDirectory, $"{baseFileName}_medium.webp");
            var largePath = Path.Combine(targetDirectory, $"{baseFileName}_large.webp");
            var basePath = Path.Combine(targetDirectory, $"{baseFileName}.webp"); // Standard/Fallback mapping

            // Rewind stream if seekable
            if (imageStream.CanSeek)
            {
                imageStream.Position = 0;
            }

            // Load original image using ImageSharp
            using var image = await Image.LoadAsync(imageStream, cancellationToken);

            // Compress and convert to WebP with a balanced quality of 75 (optimal size/quality ratio)
            var webpEncoder = new WebpEncoder { Quality = 75 };

            // 1. Generate Large Image (Max width/height 1200px)
            using (var largeImg = image.Clone(x => x.Resize(new ResizeOptions
            {
                Size = new Size(1200, 1200),
                Mode = ResizeMode.Max
            })))
            {
                await largeImg.SaveAsWebpAsync(largePath, webpEncoder, cancellationToken);
                // Also save to base path as a fallback
                await largeImg.SaveAsWebpAsync(basePath, webpEncoder, cancellationToken);
            }

            // 2. Generate Medium Image (Max width/height 600px)
            using (var mediumImg = image.Clone(x => x.Resize(new ResizeOptions
            {
                Size = new Size(600, 600),
                Mode = ResizeMode.Max
            })))
            {
                await mediumImg.SaveAsWebpAsync(mediumPath, webpEncoder, cancellationToken);
            }

            // 3. Generate Thumbnail Image (Max width/height 200px)
            using (var thumbImg = image.Clone(x => x.Resize(new ResizeOptions
            {
                Size = new Size(200, 200),
                Mode = ResizeMode.Max
            })))
            {
                await thumbImg.SaveAsWebpAsync(thumbPath, webpEncoder, cancellationToken);
            }

            // Return the relative base url path (database stores this)
            return $"/uploads/products/{baseFileName}.webp";
        }
    }
}
