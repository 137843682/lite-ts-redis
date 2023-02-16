# ![Version](https://img.shields.io/badge/version-1.1.0-green.svg)

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