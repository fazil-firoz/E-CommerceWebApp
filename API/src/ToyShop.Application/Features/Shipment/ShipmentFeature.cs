using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Application.DTOs;
using ToyShop.Domain.Entities;
using ToyShop.Shared.Models;

namespace ToyShop.Application.Features.Shipment
{
    // Queries
    public record GetShipmentMethodsQuery(bool IncludeInactive = false) : IRequest<BaseResponse<List<ShipmentMethodDto>>>;

    // Commands
    public record UpdateShipmentMethodCommand(UpdateShipmentMethodRequest Request) : IRequest<BaseResponse<ShipmentMethodDto>>;

    // Handlers
    public class ShipmentQueryHandler :
        IRequestHandler<GetShipmentMethodsQuery, BaseResponse<List<ShipmentMethodDto>>>
    {
        private readonly IRepository<ShipmentMethod> _repository;

        public ShipmentQueryHandler(IRepository<ShipmentMethod> repository)
        {
            _repository = repository;
        }

        public async Task<BaseResponse<List<ShipmentMethodDto>>> Handle(GetShipmentMethodsQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();
            if (!request.IncludeInactive)
            {
                query = query.Where(sm => sm.IsActive);
            }

            var methods = await query
                .OrderBy(sm => sm.DisplayOrder)
                .ThenBy(sm => sm.Id)
                .Select(sm => new ShipmentMethodDto
                {
                    Id = sm.Id,
                    Name = sm.Name,
                    Code = sm.Code,
                    Description = sm.Description,
                    Fee = sm.Fee,
                    FreeShippingThreshold = sm.FreeShippingThreshold,
                    IsActive = sm.IsActive,
                    IsDefault = sm.IsDefault,
                    DisplayOrder = sm.DisplayOrder
                })
                .ToListAsync(cancellationToken);

            return BaseResponse<List<ShipmentMethodDto>>.Ok(methods, "Shipment methods retrieved successfully");
        }
    }

    public class ShipmentCommandHandler :
        IRequestHandler<UpdateShipmentMethodCommand, BaseResponse<ShipmentMethodDto>>
    {
        private readonly IRepository<ShipmentMethod> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ShipmentCommandHandler(IRepository<ShipmentMethod> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<ShipmentMethodDto>> Handle(UpdateShipmentMethodCommand request, CancellationToken cancellationToken)
        {
            var req = request.Request;
            var method = await _repository.GetByIdAsync(req.Id, cancellationToken);
            if (method == null)
            {
                return BaseResponse<ShipmentMethodDto>.Fail("Shipment method not found");
            }

            method.Name = req.Name;
            method.Description = req.Description;
            method.Fee = req.Fee < 0 ? 0 : req.Fee;
            method.FreeShippingThreshold = req.FreeShippingThreshold < 0 ? 0 : req.FreeShippingThreshold;
            method.IsActive = req.IsActive;
            method.IsDefault = req.IsDefault;
            method.UpdatedDate = DateTimeOffset.UtcNow;

            _repository.Update(method);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = new ShipmentMethodDto
            {
                Id = method.Id,
                Name = method.Name,
                Code = method.Code,
                Description = method.Description,
                Fee = method.Fee,
                FreeShippingThreshold = method.FreeShippingThreshold,
                IsActive = method.IsActive,
                IsDefault = method.IsDefault,
                DisplayOrder = method.DisplayOrder
            };

            return BaseResponse<ShipmentMethodDto>.Ok(dto, "Shipment method updated successfully");
        }
    }
}
