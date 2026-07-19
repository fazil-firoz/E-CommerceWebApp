using MediatR;
using System.Threading;
using System.Threading.Tasks;
using ToyShop.Application.Common.Interfaces;
using ToyShop.Domain.Entities;
using ToyShop.Domain.Enums;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ToyShop.Shared.Models;
using System;

namespace ToyShop.Application.Features.Payments
{
    // Commands
    public record VerifyPaymentCommand(
        int OrderId,
        string RazorpayOrderId,
        string RazorpayPaymentId,
        string RazorpaySignature
    ) : IRequest<BaseResponse<bool>>;

    // Handlers
    public class PaymentsCommandHandler : IRequestHandler<VerifyPaymentCommand, BaseResponse<bool>>
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Payment> _paymentRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRazorpayService _razorpayService;
        private readonly IUnitOfWork _unitOfWork;

        public PaymentsCommandHandler(
            IRepository<Order> orderRepository,
            IRepository<Payment> paymentRepository,
            IRepository<Product> productRepository,
            IRazorpayService razorpayService,
            IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _paymentRepository = paymentRepository;
            _productRepository = productRepository;
            _razorpayService = razorpayService;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<bool>> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.Query()
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                return BaseResponse<bool>.Fail("Order not found");

            // Verify Signature
            bool isSignatureValid = _razorpayService.VerifyPaymentSignature(
                request.RazorpayOrderId,
                request.RazorpayPaymentId,
                request.RazorpaySignature
            );

            if (!isSignatureValid)
            {
                // Create a failed payment record
                var failedPayment = new Payment
                {
                    OrderId = order.Id,
                    TransactionId = request.RazorpayPaymentId ?? "FAILED_TX",
                    Amount = order.TotalAmount,
                    PaymentStatus = PaymentStatus.Failed
                };
                await _paymentRepository.AddAsync(failedPayment, cancellationToken);
                
                order.PaymentStatus = PaymentStatus.Failed;
                _orderRepository.Update(order);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return BaseResponse<bool>.Fail("Payment verification failed. Invalid signature.");
            }

            // Verify order total and stock availability again before completing payment
            foreach (var item in order.OrderItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
                if (product == null)
                    return BaseResponse<bool>.Fail($"Product ID {item.ProductId} no longer exists");

                if (product.StockQuantity < item.Quantity)
                    return BaseResponse<bool>.Fail($"Insufficient stock for {product.Name} to finalize order");
            }

            // Update product stocks
            foreach (var item in order.OrderItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
                if (product != null)
                {
                    product.StockQuantity -= item.Quantity;
                    _productRepository.Update(product);
                }
            }

            // Create successful payment record
            var payment = new Payment
            {
                OrderId = order.Id,
                TransactionId = request.RazorpayPaymentId,
                Amount = order.TotalAmount,
                PaymentStatus = PaymentStatus.Success
            };
            await _paymentRepository.AddAsync(payment, cancellationToken);

            // Update order status
            order.PaymentStatus = PaymentStatus.Success;
            order.OrderStatus = OrderStatus.Paid;
            order.UpdatedDate = DateTimeOffset.UtcNow;
            
            _orderRepository.Update(order);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<bool>.Ok(true, "Payment verified and order finalized successfully");
        }
    }
}
