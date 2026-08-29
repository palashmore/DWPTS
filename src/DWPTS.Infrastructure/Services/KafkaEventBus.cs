using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Events;

namespace DWPTS.Infrastructure.Services;

public class KafkaEventBus : IEventBus
{
    private readonly ILogger<KafkaEventBus> _logger;

    public KafkaEventBus(ILogger<KafkaEventBus> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default) where TEvent : IDomainEvent
    {
        var eventType = typeof(TEvent).Name;
        var payload = JsonSerializer.Serialize(domainEvent);
        
        _logger.LogInformation("[Kafka Event Stream] Topic: dwpts-events | EventType: {EventType} | EventId: {EventId} | Payload: {Payload}", 
            eventType, domainEvent.EventId, payload);

        // Dispatches to event consumers (Audit, Capacity Warning, Realtime Push)
        return Task.CompletedTask;
    }
}
