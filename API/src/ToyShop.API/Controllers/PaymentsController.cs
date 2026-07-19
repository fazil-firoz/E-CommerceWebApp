using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ToyShop.Application.Features.Payments;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class PaymentsController : BaseApiController
    {
        [HttpPost("verify")]
        public async Task<ActionResult<BaseResponse<bool>>> Verify(VerifyPaymentCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
