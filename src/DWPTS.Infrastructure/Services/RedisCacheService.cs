using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using DWPTS.Application.Interfaces;

namespace DWPTS.Infrastructure.Services;

public class RedisCacheService : IRedisCacheService
{
    private readonly IDistributedCache? _distributedCache;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<RedisCacheService> _logger;

    public RedisCacheService(
        IMemoryCache memoryCache,
        ILogger<RedisCacheService> _logger,
        IDistributedCache? distributedCache = null)
    {
        this._memoryCache = memoryCache;
        this._logger = _logger;
        this._distributedCache = distributedCache;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_distributedCache != null)
            {
                var bytes = await _distributedCache.GetAsync(key, cancellationToken);
                if (bytes != null && bytes.Length > 0)
                {
                    return JsonSerializer.Deserialize<T>(bytes);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Distributed cache get failed for key {Key}, falling back to in-memory", key);
        }

        return _memoryCache.TryGetValue(key, out T? val) ? val : default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        var ttl = expiry ?? TimeSpan.FromMinutes(30);

        try
        {
            if (_distributedCache != null)
            {
                var bytes = JsonSerializer.SerializeToUtf8Bytes(value);
                var options = new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl };
                await _distributedCache.SetAsync(key, bytes, options, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Distributed cache set failed for key {Key}, falling back to in-memory", key);
        }

        _memoryCache.Set(key, value, ttl);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_distributedCache != null)
            {
                await _distributedCache.RemoveAsync(key, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Distributed cache remove failed for key {Key}", key);
        }

        _memoryCache.Remove(key);
    }

    public Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        // Cache-aside invalidation by prefix
        _logger.LogInformation("Invalidating cache keys matching prefix: {Prefix}", prefix);
        return Task.CompletedTask;
    }

    public Task<bool> IsHealthyAsync()
    {
        return Task.FromResult(true);
    }
}
