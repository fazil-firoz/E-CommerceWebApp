using MediatR;
using Microsoft.AspNetCore.Mvc;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.ShopThemes;

namespace ToyShop.API.Controllers
{
    [ApiController]
    [Route("api/themes")]
    public class ShopThemeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ShopThemeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTheme()
        {
            var response = await _mediator.Send(new GetActiveThemeQuery());
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllThemes()
        {
            var response = await _mediator.Send(new GetAllThemesQuery());
            return Ok(response);
        }

        [HttpPost("{id}/select")]
        public async Task<IActionResult> SelectActiveTheme(int id)
        {
            var response = await _mediator.Send(new SelectActiveThemeCommand(id));
            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTheme(int id, [FromBody] UpdateShopThemeRequest request)
        {
            var response = await _mediator.Send(new UpdateShopThemeCommand(id, request));
            return Ok(response);
        }
    }
}
