using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Orders;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class OrdersController : BaseApiController
    {
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<List<OrderDto>>>> GetAll(
            [FromQuery] int? orderStatus,
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate,
            [FromQuery] string? search)
        {
            return Ok(await Mediator.Send(new GetOrdersQuery(orderStatus, startDate, endDate, search)));
        }

        /// <summary>
        /// Public endpoint to fetch order history for a customer by email (including guest orders placed with that email)
        /// </summary>
        [HttpGet("my-orders")]
        [AllowAnonymous]
        public async Task<ActionResult<BaseResponse<List<OrderDto>>>> GetMyOrders([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(BaseResponse<List<OrderDto>>.Fail("Email is required"));

            return Ok(await Mediator.Send(new GetOrdersQuery(CustomerEmail: email.Trim())));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BaseResponse<OrderDto>>> GetById(int id)
        {
            var result = await Mediator.Send(new GetOrderByIdQuery(id));
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<BaseResponse<RazorpayOrderResponseDto>>> Create(CreateOrderCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Update order status. When setting to Shipped (status=2), 
        /// CourierName and TrackingNumber are required.
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            var result = await Mediator.Send(new UpdateOrderStatusCommand(id, request.OrderStatus, request.CourierName, request.TrackingNumber));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }

    /// <summary>Request body for updating order status</summary>
    public class UpdateOrderStatusRequest
    {
        public int OrderStatus { get; set; }
        public string? CourierName { get; set; }
        public string? TrackingNumber { get; set; }
    }
}
