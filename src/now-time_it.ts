import { ok, strictEqual } from 'assert';
import { DateTime, TimeGranularity } from 'lite-ts-time';
import moment from 'moment';

import { IoredisAdapter } from './ioredis-adapter';
import { RedisNowTime as Self } from './now-time';

const cfg = {
    host: '127.0.0.1',
    port: 6379,
};
const redis = new IoredisAdapter(cfg);
const time = new DateTime();

describe('src/now-time.ts', () => {
    describe('.isSame(unixTime: number, granularity: string)', () => {
        it('same day', async () => {
            const endDayUnix = moment().endOf('day').unix();
            const res = await new Self(redis, time).isSameUnix(endDayUnix, TimeGranularity.day);
            strictEqual(res, true);
        });

        it('diff day', async () => {
            const endDayUnix = moment().endOf('day').unix();
            const res = await new Self(redis, time).isSameUnix(endDayUnix + 1, TimeGranularity.day);
            strictEqual(res, false);
        });
    });

    describe('.unix()', () => {
        it('ok', async () => {
            const self = new Self(redis, time);
            const unix = await self.unix();
            ok(Math.floor(Date.now() / 1000) - unix < 5);
        });
    });
});