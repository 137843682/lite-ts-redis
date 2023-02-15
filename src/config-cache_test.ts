import { notStrictEqual, strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { RedisConfigCache as Self } from './config-cache';
import { RedisBase } from './redis-base';

describe('src/config-cache.ts', () => {
    describe('.flush()', () => {
        it('ok', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'data-key', 'time-field');

            mockRedis.expected.hset(
                Self.timeRedisKey,
                'time-field',
                Date.now().toString()
            );

            await self.flush();
        });
    });

    describe('.get<T>(key: string)', () => {
        it('ok', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'data-key', 'time-field');

            mockRedis.expectReturn(
                r => r.hget(Self.timeRedisKey, 'time-field'),
                ''
            );

            mockRedis.expectReturn(
                r => r.hget(Self.timeRedisKey, 'time-field'),
                ''
            );

            mockRedis.expectReturn(
                r => r.hgetall('data-key'),
                {
                    a: '1'
                }
            );

            const res = await self.get<number>('a');
            await self.get<number>('a');
            strictEqual(res, 1);

            const nextCheckOn = Reflect.get(self, 'nextCheckOn');
            notStrictEqual(nextCheckOn, 0);
        });
    });
});