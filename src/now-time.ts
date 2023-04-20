import { NowTimeBase, TimeBase } from 'lite-ts-time';

import { RedisBase } from './redis-base';

export class RedisNowTime extends NowTimeBase {
    public constructor(
        private m_Redis: RedisBase,
        time: TimeBase
    ) {
        super(time);
    }

    public async unix() {
        const res = await this.m_Redis.time();
        return parseInt(res[0]);
    }
}