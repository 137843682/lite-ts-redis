# redis client

![Version](https://img.shields.io/badge/version-1.1.0-green.svg)

## 安装
```
npm install lite-ts-redis
```

## 使用

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

## 时间服务器

```typescript
import { IoredisAdapter, RedisNowTime } from 'lite-ts-redis';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

const nowTime = new RedisNowTime(redis);
await nowTime.unix(); // 获取当前时间戳（秒）
```

## 互斥锁的使用

互斥锁还需要使用到 `lite-ts-thread` 库的 `SetTimeoutThread`

```typescript
import { IoredisAdapter, RedisMutex } from 'lite-ts-redis';
import { SetTimeoutThread } from 'lite-ts-thread';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

const mutex = new RedisMutex(redis, new SetTimeoutThread());
const unlock = await mutex.lock({
    key: '锁的key',
    timeoutSeconds: 3, // 过期时间，如果没有设置该属性，那么是等待锁，等到一定时间获取不到，会抛出异常；如果设置了，只会获取一次锁，获取不到返回 null 
});
await unlock(); // 释放锁
```

## 配置缓存

```typescript
import { IoredisAdapter, RedisConfigCache } from 'lite-ts-redis';

const redis = new IoredisAdapter({
    host: '127.0.0.1',
    port: 6379,
    db: 1
});

const cache = new RedisConfigCache('framework-dev-gateway:Config:data-source', redis, 'ball-mage-prop:Enum');
await cache.get<T>('LoadBalance');
await cache.flush();
```
