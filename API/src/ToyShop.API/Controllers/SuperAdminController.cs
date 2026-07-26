using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ToyShop.Application.Features.SuperAdmin;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class SuperAdminController : BaseApiController
    {
        /// <summary>
        /// Get current menu & feature access control flags
        /// </summary>
        [HttpGet("control")]
        [AllowAnonymous]
        public async Task<ActionResult<BaseResponse<SuperAdminControlDto>>> GetControl()
        {
            return Ok(await Mediator.Send(new GetSuperAdminControlQuery()));
        }

        /// <summary>
        /// Verify Super Admin credentials hardcoded/configured in appsettings.json
        /// </summary>
        [HttpPost("verify")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> Verify([FromBody] SuperAdminLoginRequest request)
        {
            var result = await Mediator.Send(new VerifySuperAdminCredentialsQuery(request.Username, request.Password));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Update menu controllers and feature access control flags
        /// </summary>
        [HttpPut("control")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<SuperAdminControlDto>>> UpdateControl([FromBody] UpdateSuperAdminControlRequest request)
        {
            var result = await Mediator.Send(new UpdateSuperAdminControlCommand(request));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Factory Reset all database tables (Products, Orders, Customers, Coupons, etc.)
        /// Requires typing 'RESET DATABASE' confirmation phrase.
        /// </summary>
        [HttpPost("reset-database")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> ResetDatabase([FromBody] ResetDatabaseRequest request)
        {
            var result = await Mediator.Send(new ResetDatabaseCommand(request.ConfirmationWord));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }

    public class ResetDatabaseRequest
    {
        public string ConfirmationWord { get; set; } = string.Empty;
    }
}
