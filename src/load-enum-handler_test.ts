import { deepStrictEqual } from 'assert';
import { Enum, LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';
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
            await self.handle({
                enum: null,
                res
            });
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

            const mockHandler = new Mock<LoadEnumHandlerBase>();
            self.setNext(mockHandler.actual);

            const res = {};
            mockHandler.expected.handle({
                enum: {
                    name: 't'
                } as any,
                res
            });

            await self.handle({
                enum: {
                    name: 't'
                } as any,
                res
            });
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

            await self.handle({
                enum: {
                    name: 't'
                } as any,
                res: {}
            });
        });

        it('加载数据并读取缓存', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'ball-mage-prop-ValueTypeData');

            Reflect.set(
                self,
                'm_NextCheckOn',
                Date.now() - 100
            )

            mockRedis.expectReturn(
                r => r.hget('cache', 'ball-mage-prop-ValueTypeData'),
                '1'
            );

            const mockEnum = new Mock<Enum<any>>({
                name: 'ValueTypeData'
            });
            const opt = {
                enum: mockEnum.actual,
                res: {}
            };
            const mockHandler = new Mock<LoadEnumHandlerBase>({
                handle(opt: LoadEnumHandleOption) {
                    opt.res = {
                        0: {
                            value: 0
                        }
                    };
                }
            });
            self.setNext(mockHandler.actual);

            await self.handle(opt);
            deepStrictEqual(opt.res, {
                0: {
                    value: 0
                }
            });

            await self.handle({
                enum: mockEnum.actual,
                res: {}
            });
            deepStrictEqual(opt.res, {
                0: {
                    value: 0
                }
            });
        });

        it('更新时间相同时读取缓存', async () => {
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(mockRedis.actual, 'ball-mage-prop-ValueTypeData');

            Reflect.set(
                self,
                'm_NextCheckOn',
                Date.now() - 100
            )

            Reflect.set(
                self,
                'm_UpdateOn',
                1
            )

            Reflect.set(
                self,
                'm_Value',
                {
                    ValueTypeData: {
                        0: {
                            value: 0
                        }
                    }
                }
            )

            mockRedis.expectReturn(
                r => r.hget('cache', 'ball-mage-prop-ValueTypeData'),
                '1'
            );

            const mockEnum = new Mock<Enum<any>>({
                name: 'ValueTypeData'
            });
            const opt = {
                enum: mockEnum.actual,
                res: {}
            };
            await self.handle(opt);
            deepStrictEqual(opt.res, {
                0: {
                    value: 0
                }
            });
        });
    });
});