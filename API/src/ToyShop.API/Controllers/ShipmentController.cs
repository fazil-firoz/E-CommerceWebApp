using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Shipment;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class ShipmentController : BaseApiController
    {
        /// <summary>
        /// Get all shipment methods (Admin can include inactive methods)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<BaseResponse<List<ShipmentMethodDto>>>> GetAll([FromQuery] bool includeInactive = false)
        {
            // If requesting inactive methods, verify admin role
            bool allowInactive = includeInactive && User.IsInRole("Admin");
            return Ok(await Mediator.Send(new GetShipmentMethodsQuery(allowInactive)));
        }

        /// <summary>
        /// Update shipment method settings (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<ShipmentMethodDto>>> Update(int id, [FromBody] UpdateShipmentMethodRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest(BaseResponse<ShipmentMethodDto>.Fail("Route ID and Body ID mismatch"));
            }

            var result = await Mediator.Send(new UpdateShipmentMethodCommand(request));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
