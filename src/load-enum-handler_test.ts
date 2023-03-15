import { deepStrictEqual } from 'assert';
import { LoadEnumHandlerBase } from 'lite-ts-enum';
import { Mock } from 'lite-ts-mock';

import { LoadRedisEnumHandler as Self } from './load-enum-handler';
import { RedisBase } from './redis-base';

describe('src/load-enum-handler.ts', () => {
    describe('.handle(opt: LoadEnumHandlerBase)', () => {
        it('检测失败', async () => {
            const self = new Self(null, null, null);

            Reflect.set(
                self,
                'm_Cache',
                {
                    't': {
                        nextCheckOn: Date.now() * 2
                    }
                }
            );

            const res = {};
            await self.handle({
                enum: {
                    name: 't'
                } as any,
                res
            });
            deepStrictEqual(res, {});
        });

        it('加载数据', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'f', null);
            Reflect.set(
                self,
                'm_Cache',
                {
                    't': {
                        nextCheckOn: Date.now() - 100,
                        updateOn: 0,
                        data: {}
                    }
                }
            );

            mockRedis.expectReturn(
                r => r.hget('cache', 'f:t'),
                '1'
            );

            const mockHandler = new Mock<LoadEnumHandlerBase>();
            self.setNext(mockHandler.actual);

            const opt = {
                enum: {
                    name: 't'
                } as any,
                res: {}
            };
            mockHandler.expected.handle(opt);

            await self.handle(opt);
            deepStrictEqual(opt.res, {});
        });

        it('无需加载数据', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'f', null);

            Reflect.set(
                self,
                'm_Cache',
                {
                    't': {
                        nextCheckOn: Date.now() - 100,
                        updateOn: 0,
                        data: {}
                    }
                }
            );

            mockRedis.expectReturn(
                r => r.hget('cache', 'f:t'),
                '0'
            );

            await self.handle({
                enum: {
                    name: 't'
                } as any,
                res: {}
            });
        });

        it('缓存为空加载所有数据', async () => {
            const mockAllEnumHandler = new Mock<LoadEnumHandlerBase>();
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'f', mockAllEnumHandler.actual);

            mockAllEnumHandler.expectReturn(
                r => r.handle(null),
                Reflect.set(
                    self,
                    'm_Cache',
                    {
                        't': {
                            nextCheckOn: Date.now() * 2,
                            data: {
                                2: {
                                    value: 2
                                }
                            }
                        }
                    }
                )
            );

            const opt = {
                enum: {
                    name: 't'
                } as any,
                res: {}
            };

            await self.handle(opt);

            deepStrictEqual(opt.res, {
                2: {
                    value: 2
                }
            });
        });
    });
});