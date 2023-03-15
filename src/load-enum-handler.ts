import { LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';

import { LoadRedisEnumHandlerBase } from './load-redis-enum-handler-base';
import { RedisBase } from './redis-base';

export class LoadRedisEnumHandler extends LoadRedisEnumHandlerBase {
    private m_Cache: {
        [key: string]: {
            nextCheckOn: number;
            updateOn: number;
            data: any;
        };
    };

    public constructor(
        private m_Redis: RedisBase,
        private m_TimeField: string,
        private m_LoadAllEnumHandler: LoadEnumHandlerBase
    ) {
        super();
    }

    public async flush(name: string) {
        const now = Date.now();
        this.m_Cache[name].nextCheckOn = now;
        await this.m_Redis.hset(
            'cache',
            `${this.m_TimeField}:${name}`,
            now.toString()
        );
    }

    public async handle(opt: LoadEnumHandleOption) {
        const now = Date.now();
        if (!this.m_Cache) {
            const allEnumOpt = { res: {} } as any;
            await this.m_LoadAllEnumHandler.handle(allEnumOpt);
            this.m_Cache = allEnumOpt.res;
        }

        if (this.m_Cache[opt.enum.name].nextCheckOn >= now) {
            opt.res = this.m_Cache[opt.enum.name].data;
            return;
        }

        const value = await this.m_Redis.hget('cache', `${this.m_TimeField}:${opt.enum.name}`);
        const lastCacheOn = parseInt(value) || now;
        if (this.m_Cache[opt.enum.name].updateOn != lastCacheOn) {
            await this.next?.handle(opt);
            this.m_Cache[opt.enum.name].updateOn = lastCacheOn;
            this.m_Cache[opt.enum.name].data = opt.res;
        }

        this.m_Cache[opt.enum.name].nextCheckOn = now + 5_000 + Math.floor(
            Math.random() * 55_000
        );

        opt.res = this.m_Cache[opt.enum.name].data;
    }
}