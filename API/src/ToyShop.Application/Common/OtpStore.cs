using System;
using System.Collections.Concurrent;

namespace ToyShop.Application.Common
{
    /// <summary>
    /// Thread-safe in-memory OTP store. Lives in Application layer to avoid circular dependencies.
    /// Registered as Singleton in Infrastructure DI so OTPs persist across requests.
    /// Replace with Redis or DB-backed store for multi-instance deployments.
    /// </summary>
    public class OtpStore
    {
        private record OtpEntry(string HashedOtp, DateTime ExpiresAt, int AttemptCount);

        private readonly ConcurrentDictionary<string, OtpEntry> _store = new(StringComparer.OrdinalIgnoreCase);

        private const int OtpExpiryMinutes = 10;
        private const int MaxAttempts = 5;

        public void Store(string email, string otp)
        {
            var hashed = HashOtp(otp);
            var entry = new OtpEntry(hashed, DateTime.UtcNow.AddMinutes(OtpExpiryMinutes), 0);
            _store[email] = entry;
        }

        public OtpVerifyResult Verify(string email, string otp)
        {
            if (!_store.TryGetValue(email, out var entry))
                return OtpVerifyResult.NotFound;

            if (DateTime.UtcNow > entry.ExpiresAt)
            {
                _store.TryRemove(email, out _);
                return OtpVerifyResult.Expired;
            }

            if (entry.AttemptCount >= MaxAttempts)
                return OtpVerifyResult.TooManyAttempts;

            _store[email] = entry with { AttemptCount = entry.AttemptCount + 1 };

            if (HashOtp(otp) != entry.HashedOtp)
                return OtpVerifyResult.Invalid;

            _store.TryRemove(email, out _);
            return OtpVerifyResult.Success;
        }

        private static string HashOtp(string otp)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(otp);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }

    public enum OtpVerifyResult
    {
        Success, Invalid, Expired, NotFound, TooManyAttempts
    }
}
