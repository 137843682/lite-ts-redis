import { LoadConfigHandleOption, LoadConfigHandlerBase } from 'lite-ts-config';

import { ICache } from './i-cache';
import { RedisBase } from './redis-base';

export class LoadRedisCacheConfigHandler extends LoadConfigHandlerBase implements ICache {
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
        private m_Redis: RedisBase,
        private m_TimeField: string,
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

    public async handle(opt: LoadConfigHandleOption) {
        opt.areaNo ??= 0;
        this.m_Cache[opt.areaNo] ??= {};
        this.m_Cache[opt.areaNo][opt.name] ??= {
            nextCheckOn: 0,
            updateOn: 0,
            data: null
        };

        const now = Date.now();
        if (this.m_Cache[opt.areaNo][opt.name].nextCheckOn < now) {
            const value = await this.m_Redis.hget(`cache:${opt.areaNo}`, `${this.m_TimeField}:${opt.name}`);
            const lastCacheOn = parseInt(value) || now;
            if (this.m_Cache[opt.areaNo][opt.name].updateOn != lastCacheOn) {
                this.m_Cache[opt.areaNo][opt.name].updateOn = lastCacheOn;
                const optData: LoadConfigHandleOption = {
                    name: opt.name,
                    areaNo: opt.areaNo
                };
                await this.next?.handle?.(optData);
                this.m_Cache[opt.areaNo][opt.name].data = optData.res;
            }

            this.m_Cache[opt.areaNo][opt.name].nextCheckOn = now + 5_000 + Math.floor(
                Math.random() * 55_000
            );
        }

        opt.res = this.m_Cache[opt.areaNo][opt.name].data;
    }
}