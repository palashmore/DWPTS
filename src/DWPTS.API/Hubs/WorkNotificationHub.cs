using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace DWPTS.API.Hubs;

public class WorkNotificationHub : Hub
{
    public async Task JoinEmployeeGroup(string employeeCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"emp_{employeeCode.ToLower()}");
    }

    public async Task LeaveEmployeeGroup(string employeeCode)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"emp_{employeeCode.ToLower()}");
    }
}
