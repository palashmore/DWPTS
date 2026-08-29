using System;
using System.Threading;
using System.Threading.Tasks;
using DWPTS.Domain.Events;

namespace DWPTS.Application.Interfaces;

public interface IRedisCacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default);
    Task<bool> IsHealthyAsync();
}

public interface IEventBus
{
    Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default) where TEvent : IDomainEvent;
}

public interface ISignalRNotifier
{
    Task NotifyWorkEntryCreatedAsync(string username, object payload);
    Task NotifyCapacityAlertAsync(string username, object payload);
    Task NotifyImportCompletedAsync(string username, object payload);
    Task BroadcastSystemStatusAsync(object status);
}

public interface ICurrentTenantContext
{
    string TenantId { get; }
    string OrganizationId { get; }
    int? UserId { get; }
    string Username { get; }
    string Role { get; }
}
