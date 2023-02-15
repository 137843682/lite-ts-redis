import { ICache } from './i-cache';
import { ITraceable } from './i-traceable';
import { RedisBase } from './redis-base';
import { TracerWrapper } from './tracer-wrapper';

export class RedisConfigCache implements ICache, ITraceable<ICache> {
    public static timeRedisKey = 'cache';

    protected nextCheckOn = 0;
    protected value: Promise<{ [key: string]: any; }>;

    public updateOn = 0;

    public constructor(
        protected redis: RedisBase,
        protected dataKey: string,
        protected timeField: string,
    ) { }

    public async flush() {
        this.nextCheckOn = 0;
        await this.redis.hset(
            RedisConfigCache.timeRedisKey,
            this.timeField,
            Date.now().toString()
        );
    }

    public async get<T>(key: string) {
        const now = Date.now();
        if (this.nextCheckOn < now) {
            const timeValue = await this.redis.hget(RedisConfigCache.timeRedisKey, this.timeField);
            const lastCacheOn = parseInt(timeValue) || now;
            if (this.updateOn != lastCacheOn) {
                this.updateOn = lastCacheOn;
                this.value = new Promise<{ [key: string]: any; }>(async (s, f) => {
                    try {
                        const v = await this.redis.hgetall(this.dataKey);
                        s(
                            Object.entries(v).reduce((memo, [ck, cv]) => {
                                memo[ck] = JSON.parse(cv);
                                return memo;
                            }, {}),
                        );
                    } catch (ex) {
                        f(ex);
                    }
                });
            }

            this.nextCheckOn = now + 5_000 + Math.floor(
                Math.random() * 55_000
            );
        }

        const value = await this.value;
        return value[key] as T;
    }

    public withTrace(parentSpan: any) {
        if (!parentSpan)
            return this;

        const self = new RedisConfigCache(
            new TracerWrapper(this.redis).withTrace(parentSpan),
            this.dataKey,
            this.timeField,
        );
        self.nextCheckOn = this.nextCheckOn;
        self.updateOn = this.updateOn;
        self.value = this.value;
        return self;
    }
}