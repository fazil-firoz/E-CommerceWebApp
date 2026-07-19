using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Auth;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class AuthController : BaseApiController
    {
        /// <summary>
        /// Send a 6-digit OTP to the customer's email address.
        /// POST /api/auth/send-otp
        /// </summary>
        [HttpPost("send-otp")]
        public async Task<ActionResult<BaseResponse<bool>>> SendOtp([FromBody] SendOtpRequest request)
        {
            var result = await Mediator.Send(new SendOtpCommand(request.Email));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Verify the OTP entered by the customer.
        /// POST /api/auth/verify-otp
        /// </summary>
        [HttpPost("verify-otp")]
        public async Task<ActionResult<BaseResponse<CustomerLoginDto>>> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var result = await Mediator.Send(new VerifyOtpCommand(request.Email, request.Otp));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }

    public class SendOtpRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}
