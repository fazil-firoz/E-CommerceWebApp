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

namespace ToyShop.Application.Features.Products
{
    // Queries
    public record GetProductsQuery(int? CategoryId, string? Search, bool AdminMode = false) : IRequest<BaseResponse<List<ProductDto>>>;
    
    public record GetProductByIdQuery(int Id) : IRequest<BaseResponse<ProductDto>>;

    // Commands
    public record CreateProductCommand(
        string Name, 
        string? Description, 
        decimal Price, 
        int StockQuantity, 
        int CategoryId, 
        List<string> ImageUrls
    ) : IRequest<BaseResponse<int>>;

    public record UpdateProductCommand(
        int Id,
        string Name,
        string? Description,
        decimal Price,
        int StockQuantity,
        int CategoryId,
        List<string> ImageUrls,
        bool IsActive
    ) : IRequest<BaseResponse<bool>>;

    public record DeleteProductCommand(int Id) : IRequest<BaseResponse<bool>>;

    // Handlers
    public class ProductsQueryHandler : 
        IRequestHandler<GetProductsQuery, BaseResponse<List<ProductDto>>>,
        IRequestHandler<GetProductByIdQuery, BaseResponse<ProductDto>>
    {
        private readonly IRepository<Product> _productRepository;

        public ProductsQueryHandler(IRepository<Product> productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<BaseResponse<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            var query = _productRepository.Query()
                .Include(p => p.Category)
                .Include(p => p.Images)
                .AsQueryable();

            if (!request.AdminMode)
            {
                query = query.Where(p => p.IsActive);
            }

            if (request.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchLower = request.Search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(searchLower) || 
                                         (p.Description != null && p.Description.ToLower().Contains(searchLower)));
            }

            var products = await query
                .OrderByDescending(p => p.Id)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    IsActive = p.IsActive,
                    ImageUrls = p.Images.Where(i => !i.IsDeleted).Select(i => i.ImageUrl).ToList()
                })
                .ToListAsync(cancellationToken);

            return BaseResponse<List<ProductDto>>.Ok(products, "Products retrieved successfully");
        }

        public async Task<BaseResponse<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.Query()
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (product == null)
                return BaseResponse<ProductDto>.Fail("Product not found");

            var dto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                CategoryId = product.CategoryId,
                CategoryName = product.Category != null ? product.Category.Name : string.Empty,
                IsActive = product.IsActive,
                ImageUrls = product.Images.Where(i => !i.IsDeleted).Select(i => i.ImageUrl).ToList()
            };

            return BaseResponse<ProductDto>.Ok(dto, "Product retrieved successfully");
        }
    }

    public class ProductsCommandHandler :
        IRequestHandler<CreateProductCommand, BaseResponse<int>>,
        IRequestHandler<UpdateProductCommand, BaseResponse<bool>>,
        IRequestHandler<DeleteProductCommand, BaseResponse<bool>>
    {
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<ProductImage> _imageRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ProductsCommandHandler(
            IRepository<Product> productRepository, 
            IRepository<ProductImage> imageRepository,
            IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _imageRepository = imageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<int>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BaseResponse<int>.Fail("Validation failed", "Product name is required");
            if (request.Price <= 0)
                return BaseResponse<int>.Fail("Validation failed", "Product price must be greater than zero");

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                StockQuantity = request.StockQuantity,
                CategoryId = request.CategoryId,
                IsActive = true
            };

            if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                foreach (var url in request.ImageUrls)
                {
                    product.Images.Add(new ProductImage { ImageUrl = url });
                }
            }

            await _productRepository.AddAsync(product, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<int>.Ok(product.Id, "Product created successfully");
        }

        public async Task<BaseResponse<bool>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BaseResponse<bool>.Fail("Validation failed", "Product name is required");
            if (request.Price <= 0)
                return BaseResponse<bool>.Fail("Validation failed", "Product price must be greater than zero");

            var product = await _productRepository.Query()
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (product == null)
                return BaseResponse<bool>.Fail("Product not found");

            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.StockQuantity = request.StockQuantity;
            product.CategoryId = request.CategoryId;
            product.IsActive = request.IsActive;
            product.UpdatedDate = DateTimeOffset.UtcNow;

            // Simple update images logic: Soft delete existing ones, then add new ones
            foreach (var img in product.Images.Where(i => !i.IsDeleted))
            {
                _imageRepository.Delete(img);
            }

            if (request.ImageUrls != null)
            {
                foreach (var url in request.ImageUrls)
                {
                    product.Images.Add(new ProductImage { ImageUrl = url });
                }
            }

            _productRepository.Update(product);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Product updated successfully");
        }

        public async Task<BaseResponse<bool>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
            if (product == null)
                return BaseResponse<bool>.Fail("Product not found");

            _productRepository.Delete(product);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Product deleted successfully");
        }
    }
}
