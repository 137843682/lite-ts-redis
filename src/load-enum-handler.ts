import { LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';

import { RedisBase } from './redis-base';

export class LoadRedisEnumHandler extends LoadEnumHandlerBase {
    private m_NextCheckOn = 0;
    private m_UpdateOn = 0;
    private m_Value: { [key: string]: any; } = {};

    public constructor(
        private m_Redis: RedisBase,
        private m_TimeField: string,
    ) {
        super();
    }

    public async handle(opt: LoadEnumHandleOption) {
        if (!opt.enum)
            return;

        if (!this.m_Value[opt.enum.name]) {
            await this.next?.handle(opt);
            this.m_Value[opt.enum.name] = opt.res;
            return;
        }

        const now = Date.now();
        if (this.m_NextCheckOn < now) {
            const timeValue = await this.m_Redis.hget('cache', this.m_TimeField);
            const lastCacheOn = parseInt(timeValue) || now;
            if (this.m_UpdateOn != lastCacheOn) {
                this.m_UpdateOn = lastCacheOn;
                await this.next?.handle(opt);
                this.m_Value = {
                    [opt.enum.name]: opt.res
                };
            }
            this.m_NextCheckOn = now + 5_000 + Math.floor(
                Math.random() * 55_000
            );
        }

        opt.res = this.m_Value[opt.enum.name];
    }
}