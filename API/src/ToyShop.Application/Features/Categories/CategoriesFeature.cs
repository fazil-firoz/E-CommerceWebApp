using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Application.DTOs;
using ToyShop.Domain.Entities;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ToyShop.Shared.Models;
using System;

namespace ToyShop.Application.Features.Categories
{
    // Queries
    public record GetCategoriesQuery : IRequest<BaseResponse<List<CategoryDto>>>;

    // Commands
    public record CreateCategoryCommand(string Name, string? Description) : IRequest<BaseResponse<int>>;
    
    public record UpdateCategoryCommand(int Id, string Name, string? Description) : IRequest<BaseResponse<bool>>;
    
    public record DeleteCategoryCommand(int Id) : IRequest<BaseResponse<bool>>;

    // Handlers
    public class CategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, BaseResponse<List<CategoryDto>>>
    {
        private readonly IRepository<Category> _categoryRepository;

        public CategoriesQueryHandler(IRepository<Category> categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<BaseResponse<List<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            var categories = await _categoryRepository.Query()
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync(cancellationToken);

            return BaseResponse<List<CategoryDto>>.Ok(categories, "Categories retrieved successfully");
        }
    }

    public class CategoriesCommandHandler : 
        IRequestHandler<CreateCategoryCommand, BaseResponse<int>>,
        IRequestHandler<UpdateCategoryCommand, BaseResponse<bool>>,
        IRequestHandler<DeleteCategoryCommand, BaseResponse<bool>>
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CategoriesCommandHandler(IRepository<Category> categoryRepository, IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<int>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BaseResponse<int>.Fail("Validation failed", "Category name is required");

            var category = new Category
            {
                Name = request.Name,
                Description = request.Description
            };

            await _categoryRepository.AddAsync(category, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<int>.Ok(category.Id, "Category created successfully");
        }

        public async Task<BaseResponse<bool>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BaseResponse<bool>.Fail("Validation failed", "Category name is required");

            var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            if (category == null)
                return BaseResponse<bool>.Fail("Category not found");

            category.Name = request.Name;
            category.Description = request.Description;
            category.UpdatedDate = DateTimeOffset.UtcNow;

            _categoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Category updated successfully");
        }

        public async Task<BaseResponse<bool>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            if (category == null)
                return BaseResponse<bool>.Fail("Category not found");

            // We do a soft delete
            _categoryRepository.Delete(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Category deleted successfully");
        }
    }
}
