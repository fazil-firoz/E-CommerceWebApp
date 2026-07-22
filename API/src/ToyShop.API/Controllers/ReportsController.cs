using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using ToyShop.Application.DTOs;
using ToyShop.Application.Features.Reports;
using ToyShop.Shared.Models;

namespace ToyShop.API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class ReportsController : BaseApiController
    {
        /// <summary>
        /// Get Stock & Inventory Report with category, stock status & search filters
        /// </summary>
        [HttpGet("stock")]
        public async Task<ActionResult<BaseResponse<StockReportSummaryDto>>> GetStockReport(
            [FromQuery] int? categoryId,
            [FromQuery] string? stockStatus,
            [FromQuery] string? search)
        {
            return Ok(await Mediator.Send(new GetStockReportQuery(categoryId, stockStatus, search)));
        }

        /// <summary>
        /// Get Sales & Revenue Report with daily/monthly/yearly presets, date ranges, and order status filters
        /// </summary>
        [HttpGet("sales")]
        public async Task<ActionResult<BaseResponse<SalesReportSummaryDto>>> GetSalesReport(
            [FromQuery] string? periodPreset,
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate,
            [FromQuery] string? orderStatus,
            [FromQuery] string? customerName,
            [FromQuery] string? customerPhone,
            [FromQuery] string? search)
        {
            return Ok(await Mediator.Send(new GetSalesReportQuery(periodPreset, startDate, endDate, orderStatus, customerName, customerPhone, search)));
        }
    }
}
