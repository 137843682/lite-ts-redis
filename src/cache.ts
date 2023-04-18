import { ICache } from './i-cache';
import { RedisBase } from './redis-base';

export class RedisCache implements ICache {
    private m_Cache: {
        [areaNo: number]: {
            [key: string]: {
                nextCheckOn: number;
                updateOn: number;
                data: any;
            };
        };
    } = {};

    private m_TimeFields: {
        [ctor: string]: string;
    };

    public constructor(
        private m_Field: string,
        private m_Redis: RedisBase,
        timeFields: { [app: string]: string[]; }
    ) {
        this.m_TimeFields = Object.entries(timeFields).reduce((memo, r) => {
            r[1].forEach(cr => memo[cr] = r[0]);
            return memo;
        }, {});
    }

    public async flush(name: string, areaNo = 0) {
        if (!this.m_TimeFields[name])
            throw new Error(`${this.m_Field}.${name} 未配置`);

        const now = Date.now();
        if (this.m_Cache[areaNo]?.[name])
            this.m_Cache[areaNo][name].nextCheckOn = now;

        await this.m_Redis.hset(
            `cache:${areaNo}`,
            `${this.m_TimeFields[name]}:${this.m_Field}:${name}`,
            now.toString()
        );
    };

    public async get(name: string, areaNo: number, loadFunc: () => Promise<any>) {
        if (!this.m_TimeFields[name])
            throw new Error(`${this.m_Field}.${name} 未配置`);

        areaNo ??= 0;
        this.m_Cache[areaNo] ??= {};
        this.m_Cache[areaNo][name] ??= {
            nextCheckOn: 0,
            updateOn: 0,
            data: null
        };

        const now = Date.now();
        if (this.m_Cache[areaNo][name].nextCheckOn < now) {
            const value = await this.m_Redis.hget(`cache:${areaNo}`, `${this.m_TimeFields[name]}:${this.m_Field}:${name}`);
            const lastCacheOn = parseInt(value) || now;
            if (this.m_Cache[areaNo][name].updateOn != lastCacheOn) {
                this.m_Cache[areaNo][name].data = await loadFunc();
                this.m_Cache[areaNo][name].updateOn = lastCacheOn;
            }

            this.m_Cache[areaNo][name].nextCheckOn = now + 5_000 + Math.floor(
                Math.random() * 55_000
            );
        }

        return this.m_Cache[areaNo][name].data;
    }
}