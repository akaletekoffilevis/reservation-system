using Microsoft.AspNetCore.SignalR;

namespace Booking.API.Hubs;

public class PlanningHub : Hub
{
    public async Task JoinProfessional(int professionalId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"pro_{professionalId}");
    }

    public async Task LeaveProfessional(int professionalId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"pro_{professionalId}");
    }

    public static async Task NotifySlotBooked(IHubContext<PlanningHub> hub, int professionalId,
        DateTime startUtc, DateTime endUtc)
    {
        await hub.Clients.Group($"pro_{professionalId}").SendAsync("SlotBooked", new
        {
            professionalId,
            startUtc,
            endUtc
        });
    }

    public static async Task NotifySlotFreed(IHubContext<PlanningHub> hub, int professionalId,
        DateTime startUtc, DateTime endUtc)
    {
        await hub.Clients.Group($"pro_{professionalId}").SendAsync("SlotFreed", new
        {
            professionalId,
            startUtc,
            endUtc
        });
    }
}
