import { deepStrictEqual } from 'assert';
import { LoadHandlerBase } from 'lite-ts-enum';
import { Mock } from 'lite-ts-mock';

import { LoadRedisEnumHandler as Self } from './load-enum-handler';
import { RedisBase } from './redis-base';

describe('src/load-enum-handler.ts', () => {
    describe('.handle(enumerator: Enum<any>, res: { [value: number]: any; })', () => {
        it('检测失败', async () => {
            const self = new Self(null, null);

            Reflect.set(
                self,
                'm_NextCheckOn',
                Date.now() * 2
            );

            const res = {};
            await self.handle(null, res);
            deepStrictEqual(res, {});
        });

        it('加载数据', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'f');

            Reflect.set(
                self,
                'm_NextCheckOn',
                Date.now() - 100
            );

            mockRedis.expectReturn(
                r => r.hget('cache', 'f'),
                '1'
            );

            const mockHandler = new Mock<LoadHandlerBase>();
            self.setNext(mockHandler.actual);

            const res = {};
            mockHandler.expected.handle(null, res);

            await self.handle(null, res);
        });

        it('无需加载数据', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'f');

            Reflect.set(
                self,
                'm_NextCheckOn',
                Date.now() - 100
            );

            mockRedis.expectReturn(
                r => r.hget('cache', 'f'),
                '0'
            );

            await self.handle(null, {});
        });
    });
});