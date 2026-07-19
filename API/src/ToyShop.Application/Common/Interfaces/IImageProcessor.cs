using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace ToyShop.Application.Common.Interfaces
{
    public interface IImageProcessor
    {
        /// <summary>
        /// Resizes and converts the input image stream to WebP, saving Thumbnail, Medium, and Large versions.
        /// </summary>
        /// <param name="imageStream">Input stream containing the image bytes.</param>
        /// <param name="targetDirectory">Directory where files should be saved.</param>
        /// <param name="baseFileName">Base name of the file (without extension or suffix).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Relative URL/path of the base WebP image.</returns>
        Task<string> ProcessAndSaveImageAsync(
            Stream imageStream, 
            string targetDirectory, 
            string baseFileName, 
            CancellationToken cancellationToken = default);
    }
}
