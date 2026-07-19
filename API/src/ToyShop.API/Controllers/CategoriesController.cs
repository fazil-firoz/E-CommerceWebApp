using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Categories;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    public class CategoriesController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<BaseResponse<List<CategoryDto>>>> GetAll()
        {
            return Ok(await Mediator.Send(new GetCategoriesQuery()));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<int>>> Create(CreateCategoryCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> Update(int id, CreateCategoryCommand command)
        {
            // Map CreateCategoryCommand properties to UpdateCategoryCommand
            var result = await Mediator.Send(new UpdateCategoryCommand(id, command.Name, command.Description));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BaseResponse<bool>>> Delete(int id)
        {
            var result = await Mediator.Send(new DeleteCategoryCommand(id));
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
