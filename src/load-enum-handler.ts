import { LoadHandlerBase } from 'lite-ts-enum';
import { Enum } from 'lite-ts-enum';

import { RedisBase } from './redis-base';

export class LoadRedisEnumHandler extends LoadHandlerBase {
    private m_NextCheckOn = 0;
    private m_UpdateOn = 0;

    public constructor(
        private m_Redis: RedisBase,
        private m_TimeField: string,
    ) {
        super();
    }

    public async handle(enumerator: Enum<any>, res: { [value: number]: any; }) {
        const now = Date.now();
        if (this.m_NextCheckOn > now)
            return;

        const timeValue = await this.m_Redis.hget('cache', this.m_TimeField);
        const lastCacheOn = parseInt(timeValue) || now;
        if (this.m_UpdateOn != lastCacheOn) {
            this.m_UpdateOn = lastCacheOn;
            await this.next?.handle(enumerator, res);
        }

        this.m_NextCheckOn = now + 5_000 + Math.floor(
            Math.random() * 55_000
        );
    }
}