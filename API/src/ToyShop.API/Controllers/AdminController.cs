using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Admin;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class AdminController : BaseApiController
    {
        [HttpPost("login")]
        public async Task<ActionResult<BaseResponse<AdminLoginResponseDto>>> Login(AdminLoginCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return Unauthorized(result);
            return Ok(result);
        }

        [HttpPost("change-password")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> ChangePassword(AdminChangePasswordCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("forgot-password/request-otp")]
        public async Task<ActionResult<BaseResponse<bool>>> RequestForgotPasswordOtp([FromBody] AdminSendForgotPasswordOtpCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("forgot-password/reset")]
        public async Task<ActionResult<BaseResponse<bool>>> ResetPasswordWithOtp([FromBody] AdminResetPasswordWithOtpCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("dashboard-stats")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<DashboardStatsDto>>> GetDashboardStats()
        {
            var result = await Mediator.Send(new GetDashboardStatsQuery());
            return Ok(result);
        }
    }
}
