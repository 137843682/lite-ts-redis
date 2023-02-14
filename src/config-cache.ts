import { ICache } from './i-cache';
import { IRedis } from './i-redis';
import { ITraceable } from './i-traceable';
import { TracerStrategy } from './tracer-strategy';

export class RedisConfigCache implements ICache, ITraceable<ICache> {
    protected nextCheckOn = 0;
    protected value: { [key: string]: any; };

    public updateOn = 0;

    public constructor(
        protected redisKey: string,
        private redis: IRedis,
        private cacheKey: string,
    ) { }

    public async flush() {
        this.nextCheckOn = 0;
        await this.redis.hset(
            'cache',
            this.cacheKey,
            Date.now().toString()
        );
    }

    public async get<T>(key: string) {
        const now = Date.now();
        if (this.nextCheckOn < now) {
            const value = await this.redis.hget('cache', this.cacheKey);
            const lastCacheOn = parseInt(value) || now;
            if (this.updateOn != lastCacheOn) {
                this.updateOn = lastCacheOn;
                this.value = await this.load();
            }

            this.nextCheckOn = now + 5_000 + Math.floor(
                Math.random() * 55_000
            );
        }

        return this.value[key] as T;
    }

    public withTrace(parentSpan: any) {
        if (!parentSpan)
            return this;

        const self = new RedisConfigCache(
            this.redisKey,
            new TracerStrategy(this.redis).withTrace(parentSpan),
            this.cacheKey,
        );
        self.nextCheckOn = this.nextCheckOn;
        self.updateOn = this.updateOn;
        self.value = this.value;
        return self;
    }

    protected async load() {
        const v = await this.redis.hgetall(this.redisKey);
        return Object.entries(v).reduce((memo, [ck, cv]) => {
            memo[ck] = JSON.parse(cv);
            return memo;
        }, {});
    }
}