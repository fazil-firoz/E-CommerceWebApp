namespace ToyShop.Application.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalOrders { get; set; }
        public int TodaysOrders { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingOrders { get; set; }
    }
}
