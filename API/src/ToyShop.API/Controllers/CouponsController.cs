using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ToyShop.Application.Features.Coupons;

namespace ToyShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CouponsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetCouponsQuery());
            return Ok(result);
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidateCouponQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCouponRequest request)
        {
            var result = await _mediator.Send(new CreateCouponCommand(request));
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCouponRequest request)
        {
            var result = await _mediator.Send(new UpdateCouponCommand(id, request));
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeleteCouponCommand(id));
            return Ok(result);
        }
    }
}
