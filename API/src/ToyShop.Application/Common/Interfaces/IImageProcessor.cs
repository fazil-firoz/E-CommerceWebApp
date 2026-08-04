using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace ToyShop.Application.Common.Interfaces
{
    public interface IImageProcessor
    {
        /// <summary>
        /// Resizes and converts the input image stream to WebP, saving Thumbnail, Medium, and Large versions,
        /// or uploading to Cloudinary if configured.
        /// </summary>
        Task<string> ProcessAndSaveImageAsync(
            Stream imageStream, 
            string targetDirectory, 
            string baseFileName, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Direct upload for single files (e.g., shop logos, favicons). Uploads to Cloudinary if configured, or saves locally.
        /// </summary>
        Task<string> UploadDirectAsync(
            Stream fileStream,
            string fileName,
            string folder = "general",
            string fallbackTargetDirectory = "",
            CancellationToken cancellationToken = default);
    }
}
