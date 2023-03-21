import { LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';

import { ICache } from './i-cache';
import { RedisBase } from './redis-base';

export class LoadRedisEnumHandler extends LoadEnumHandlerBase implements ICache {
    private m_Cache: {
        [areaNo: number]: {
            [key: string]: {
                nextCheckOn: number;
                updateOn: number;
                data: any;
            };
        };
    } = {};

    public constructor(
        private m_LoadAllEnumHandler: LoadEnumHandlerBase,
        private m_Redis: RedisBase,
        private m_TimeField: string
    ) {
        super();
    }

    public async flush(name: string, areaNo = 0) {
        const now = Date.now();
        if (this.m_Cache?.[areaNo]?.[name])
            this.m_Cache[areaNo][name].nextCheckOn = now;

        await this.m_Redis.hset(
            `cache:${areaNo}`,
            `${this.m_TimeField}:${name}`,
            now.toString()
        );
    }

    public async handle(opt: LoadEnumHandleOption) {
        const now = Date.now();
        opt.areaNo ??= 0;
        if (!this.m_Cache[opt.areaNo]) {
            const allEnumOpt = { res: {} } as any;
            await this.m_LoadAllEnumHandler.handle(allEnumOpt);
            this.m_Cache[opt.areaNo] ??= {};
            const args = {};
            for (const [k, v] of Object.entries(allEnumOpt.res)) {
                this.m_Cache[opt.areaNo][k] = {
                    nextCheckOn: now,
                    updateOn: now,
                    data: v
                };
                args[`${this.m_TimeField}:${k}`] = now.toString();
            }
            await this.m_Redis.hmset(`cache:${opt.areaNo}`, args);
        }

        this.m_Cache[opt.areaNo][opt.enum.name] ??= {
            nextCheckOn: 0,
            updateOn: 0,
            data: {}
        };
        if (this.m_Cache[opt.areaNo][opt.enum.name].nextCheckOn >= now) {
            opt.res = this.m_Cache[opt.areaNo][opt.enum.name].data;
            return;
        }

        const value = await this.m_Redis.hget(`cache:${opt.areaNo}`, `${this.m_TimeField}:${opt.enum.name}`);
        const lastCacheOn = parseInt(value) || now;
        if (this.m_Cache[opt.areaNo][opt.enum.name].updateOn != lastCacheOn) {
            await this.next?.handle(opt);
            this.m_Cache[opt.areaNo][opt.enum.name].updateOn = lastCacheOn;
            this.m_Cache[opt.areaNo][opt.enum.name].data = opt.res;
        }

        this.m_Cache[opt.areaNo][opt.enum.name].nextCheckOn = now + 5_000 + Math.floor(
            Math.random() * 55_000
        );

        opt.res = this.m_Cache[opt.areaNo][opt.enum.name].data;
    }
}