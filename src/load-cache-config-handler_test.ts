import { notStrictEqual, strictEqual } from 'assert';
import { LoadConfigHandleOption, LoadConfigHandlerBase } from 'lite-ts-config';
import { Mock } from 'lite-ts-mock';

import { LoadRedisCacheConfigHandler as Self } from './load-cache-config-handler';
import { RedisBase } from './redis-base';

describe('src/load-config-handler.ts', () => {
    describe('.handle(opt: LoadConfigHandleOption)', () => {
        it('首次请求', async () => {
            const redisMock = new Mock<RedisBase>();
            const self = new Self(redisMock.actual, 'f');

            redisMock.expectReturn(
                r => r.hget('cache:0', 'f:name'),
                10
            );

            const opt = {
                name: 'name',
                areaNo: 0,
            };
            await self.handle(opt);

            const value = Reflect.get(self, 'm_Cache');
            notStrictEqual(value[0]['name'], undefined);
        });

        it('缓存已存在', async () => {
            const redisMock = new Mock<RedisBase>();
            const self = new Self(redisMock.actual, 'f');

            Reflect.set(self, 'm_Cache', {
                0: {
                    name: {
                        nextCheckOn: Date.now() + 10,
                        data: '1'
                    }
                }
            });

            const opt: LoadConfigHandleOption = {
                name: 'name',
                areaNo: 0,
            };
            await self.handle(opt);

            strictEqual(opt.res, '1');
        });

        it('缓存已过期', async () => {
            const redisMock = new Mock<RedisBase>();
            const self = new Self(redisMock.actual, 'f');

            redisMock.expectReturn(
                r => r.hget('cache:0', 'f:name'),
                100
            );

            class LoadHandler extends LoadConfigHandlerBase {
                public async handle(opt: LoadConfigHandleOption): Promise<void> {
                    opt.res = 1;
                }
            }

            self.setNext(new LoadHandler());

            Reflect.set(self, 'm_Cache', {
                0: {
                    name: {
                        nextCheckOn: Date.now() - 10,
                    }
                }
            });

            const opt: LoadConfigHandleOption = {
                name: 'name',
                areaNo: 0,
            };
            await self.handle(opt);

            strictEqual(opt.res, 1);
        });
    });
});