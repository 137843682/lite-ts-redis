# ![Version](https://img.shields.io/badge/version-1.3.1-green.svg)

## 安装
```
npm install lite-ts-redis
```

## 使用

### redis 基本操作

```typescript
import { IoredisAdapter } from 'lite-ts-redis';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

await redis.set('key', 'test');
await redis.get('key');
```

### 分布式时间

```typescript
import { IoredisAdapter, RedisNowTime } from 'lite-ts-redis';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

// 分布式时间
const nowTime = new RedisNowTime(redis);
await nowTime.unix(); // 获取当前时间（秒）
await nowTime.unixNano(); // 获取当前时间（纳秒）
```

### 分布式锁

```typescript
import { IoredisAdapter, RedisMutex } from 'lite-ts-redis';
import { SetTimeoutThread } from 'lite-ts-thread';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

// 分布式锁
const mutex = new RedisMutex(redis, new SetTimeoutThread());
const unlock = await mutex.lock({
    key: 'lock:key',
    timeoutSeconds: 3,
}); // 获取 'lock:key' 锁，锁时间为3秒，获取不到则返回 null 
if (unlock)
    await unlock(); // 如果获取到锁，则可以释放锁

const waitUnlock = await mutext.lock({
    key: 'lock:key',
    tryCount: 10, // 尝试获取次数, 默认 50
    sleepRange: [100, 200], // 每获取一次则等待[100,200]时间，再次尝试获取锁，默认为 [100,300]
}); // 获取 'lock:key' 等待锁, 到一定次数，获取不到则抛出异常
await waitUnlock();
```

### 枚举缓存

```typescript
import { IoredisAdapter, LoadRedisCacheEnumHandler, RedisCache } from 'lite-ts-redis';
import { EnumFactory } from 'lite-ts-enum';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

const loadHanlder = new LoadRedisCacheEnumHandler(new RedisCache(redis, 'ball-mage-prop:Enum'));
const enumFactory = new EnumFactory(loadHanlder, {});
```

### 配置缓存


```typescript
import { IoredisAdapter, LoadRedisCacheConfigHandler, RedisCache } from 'lite-ts-redis';
import { ConfigLoader } from 'lite-ts-config';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

const loadHanlder = new LoadRedisCacheConfigHandler(new RedisCache(redis, 'ball-mage-prop:Config'));
const configLoader = new ConfigLoader(loadHanlder);
```