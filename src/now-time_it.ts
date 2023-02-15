import { ok, strictEqual } from 'assert';
import moment from 'moment';

import { IoredisAdapter } from './ioredis-adapter';
import { RedisNowTime as Self } from './now-time';

const cfg = {
    host: '127.0.0.1',
    port: 6379,
};
const redis = new IoredisAdapter(cfg);

describe('src/now-time.ts', () => {
    describe('.isSame(unixTime: number, granularity: string)', () => {
        it('same day', async () => {
            const endDayUnix = moment().endOf('day').unix();
            const res = await new Self(redis).isSame(endDayUnix, 'day');
            strictEqual(res, true);
        });

        it('diff day', async () => {
            const endDayUnix = moment().endOf('day').unix();
            const res = await new Self(redis).isSame(endDayUnix + 1, 'day');
            strictEqual(res, false);
        });
    });

    describe('.unix()', () => {
        it('ok', async () => {
            const self = new Self(redis);
            const unix = await self.unix();
            ok(Math.floor(Date.now() / 1000) - unix < 5);
        });
    });

    describe('.unixNano()', () => {
        it('ok', async () => {
            const self = new Self(redis);
            const nanoUnix = await self.unixNano();
            const unix = parseInt(
                nanoUnix.toString().substring(0, 13),
            );
            ok(Date.now() - unix < 5);
            strictEqual(
                nanoUnix.toString().length,
                19
            );
        });
    });
});