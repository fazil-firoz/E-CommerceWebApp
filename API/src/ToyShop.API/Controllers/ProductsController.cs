using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Products;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class ProductsController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<BaseResponse<List<ProductDto>>>> GetAll(
            [FromQuery] int? categoryId, 
            [FromQuery] string? search,
            [FromQuery] bool adminMode = false)
        {
            // If requesting adminMode, verify role
            bool runAdminMode = adminMode && User.IsInRole("Admin");
            return Ok(await Mediator.Send(new GetProductsQuery(categoryId, search, runAdminMode)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BaseResponse<ProductDto>>> GetById(int id)
        {
            var result = await Mediator.Send(new GetProductByIdQuery(id));
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<int>>> Create(CreateProductCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> Update(int id, UpdateProductCommand command)
        {
            if (id != command.Id)
                return BadRequest(BaseResponse<bool>.Fail("ID mismatch between route and body"));

            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> Delete(int id)
        {
            var result = await Mediator.Send(new DeleteProductCommand(id));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
