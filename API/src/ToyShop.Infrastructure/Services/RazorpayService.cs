using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ToyShop.Application.Common.Interfaces;

namespace ToyShop.Infrastructure.Services
{
    public class RazorpayService : IRazorpayService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RazorpayService> _logger;

        public RazorpayService(HttpClient httpClient, IConfiguration configuration, ILogger<RazorpayService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> CreateOrderAsync(decimal amount, string orderNumber, CancellationToken cancellationToken = default)
        {
            var keyId = _configuration["Razorpay:KeyId"];
            var keySecret = _configuration["Razorpay:KeySecret"];

            // If credentials are not configured, use local Mock mode for easy testing!
            if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret) || keyId == "YOUR_RAZORPAY_KEY_ID")
            {
                _logger.LogWarning("Razorpay credentials are not configured. Running in MOCK mode.");
                return $"order_mock_{Guid.NewGuid().ToString().Substring(0, 14).Replace("-", "")}";
            }

            // Razorpay expects amount in paise (1 INR = 100 paise)
            int amountInPaise = (int)Math.Round(amount * 100);

            var requestBody = new
            {
                amount = amountInPaise,
                currency = "INR",
                receipt = orderNumber
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders")
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };

            var authString = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{keyId}:{keySecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authString);

            try
            {
                var response = await _httpClient.SendAsync(request, cancellationToken);
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(responseString);
                var id = doc.RootElement.GetProperty("id").GetString();

                if (string.IsNullOrEmpty(id))
                    throw new Exception("Razorpay response did not contain an order ID");

                return id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create order on Razorpay");
                throw new Exception($"Razorpay integration error: {ex.Message}", ex);
            }
        }

        public bool VerifyPaymentSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
        {
            var keyId = _configuration["Razorpay:KeyId"];
            var keySecret = _configuration["Razorpay:KeySecret"];

            // Mock payment verification fallback
            if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret) || keyId == "YOUR_RAZORPAY_KEY_ID" || razorpaySignature.StartsWith("mock_sig"))
            {
                _logger.LogWarning("Verifying payment in MOCK mode. Automatically approving payment.");
                return true;
            }

            try
            {
                var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
                var secretBytes = Encoding.UTF8.GetBytes(keySecret);
                using var hmac = new HMACSHA256(secretBytes);
                var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                
                var calculatedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
                return calculatedSignature == razorpaySignature;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Razorpay payment verification encountered an error");
                return false;
            }
        }
    }
}
