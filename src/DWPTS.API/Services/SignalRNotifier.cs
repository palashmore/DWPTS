using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using DWPTS.API.Hubs;
using DWPTS.Application.Interfaces;

namespace DWPTS.API.Services;

public class SignalRNotifier : ISignalRNotifier
{
    private readonly IHubContext<WorkNotificationHub> _hubContext;

    public SignalRNotifier(IHubContext<WorkNotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyWorkEntryCreatedAsync(string username, object payload)
    {
        await _hubContext.Clients.Group($"emp_{username.ToLower()}").SendAsync("WorkEntryCreated", payload);
        await _hubContext.Clients.Group("admins").SendAsync("WorkEntryCreated", payload);
    }

    public async Task NotifyCapacityAlertAsync(string username, object payload)
    {
        await _hubContext.Clients.Group($"emp_{username.ToLower()}").SendAsync("CapacityAlert", payload);
        await _hubContext.Clients.Group("admins").SendAsync("CapacityAlert", payload);
    }

    public async Task NotifyImportCompletedAsync(string username, object payload)
    {
        await _hubContext.Clients.All.SendAsync("ImportCompleted", payload);
    }

    public async Task BroadcastSystemStatusAsync(object status)
    {
        await _hubContext.Clients.All.SendAsync("SystemStatus", status);
    }
}
