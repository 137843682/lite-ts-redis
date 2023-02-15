import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { RedisConfigCache as Self } from './config-cache';
import { IRedis } from './i-redis';

describe('src/service/redis/config-cache.ts', () => {
    describe('.flush()', () => {
        it('ok', async () => {
            const mockRedis = new Mock<IRedis>();
            const self = new Self('redis-key', mockRedis.actual, 'test');

            mockRedis.expected.hset(
                'cache',
                'test',
                Date.now().toString()
            );

            await self.flush();
        });
    });

    describe('.get<T>(key: string)', () => {
        it('ok', async () => {
            const mockRedis = new Mock<IRedis>();
            const self = new Self('redis-key', mockRedis.actual, 'test');

            mockRedis.expectReturn(
                r => r.hget('cache', 'test'),
                ''
            );

            mockRedis.expectReturn(
                r => r.hget('cache', 'test'),
                ''
            );

            mockRedis.expectReturn(
                r => r.hgetall('redis-key'),
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

    describe('.load()', () => {
        it('ok', async () => {
            const mockRedis = new Mock<IRedis>();
            const self = new Self('redis-key', mockRedis.actual, 'cache-key');

            mockRedis.expectReturn(
                r => r.hgetall('redis-key'),
                {
                    a: JSON.stringify({
                        a1: 1,
                        a2: 2
                    }),
                    b: JSON.stringify({
                        b1: 'b',
                        b2: 'bb'
                    })
                }
            );

            const fn = Reflect.get(self, 'load').bind(self) as () => Promise<{ [key: string]: any; }>;
            const res = await fn();
            deepStrictEqual(res, {
                a: {
                    a1: 1,
                    a2: 2
                },
                b: {
                    b1: 'b',
                    b2: 'bb'
                }
            });
        });
    });
});