import { strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { RedisCache as Self } from './cache';
import { RedisBase } from './redis-base';

describe('src/cache.ts', () => {
    describe('.flush(name: string, areaNo = 0)', () => {
        it('ok', async () => {
            let hsetCount = 0;
            const redisMock = new Mock<RedisBase>({
                async hset() {
                    hsetCount++;
                }
            });
            const self = new Self('enum', redisMock.actual, { a: ['aa'] });
            await self.flush('aa');

            strictEqual(hsetCount, 1);
        });
    });

    describe('.get(name: string, areaNo: number, loadFunc: () => Promise<any>)', () => {
        it('首次加载', async () => {
            const redisMock = new Mock<RedisBase>();
            redisMock.expectReturn(
                r => r.hget('cache:0', 'a:enum:aa'),
                null
            );
            const self = new Self('enum', redisMock.actual, { a: ['aa'] });

            const data = await self.get('aa', 0, async () => 1);
            strictEqual(data, 1);
        });

        it('缓存过期', async () => {
            const redisMock = new Mock<RedisBase>();
            redisMock.expectReturn(
                r => r.hget('cache:0', 'a:enum:aa'),
                null
            );
            const self = new Self('enum', redisMock.actual, { a: ['aa'] });

            Reflect.set(self, 'm_Cache', {
                0: {
                    aa: {
                        nextCheckOn: Date.now() - 10,
                        data: 1
                    }
                }
            });

            const data = await self.get('aa', 0, async () => 2);
            strictEqual(data, 2);
        });

        it('缓存存在', async () => {
            const redisMock = new Mock<RedisBase>();
            redisMock.expectReturn(
                r => r.hget('cache:0', 'a:enum:aa'),
                Date.now() + 10
            );
            const self = new Self('enum', redisMock.actual, { a: ['aa'] });

            Reflect.set(self, 'm_Cache', {
                0: {
                    aa: {
                        nextCheckOn: Date.now() + 10,
                        data: 1
                    }
                }
            });

            const data = await self.get('aa', 0, async () => 2);
            strictEqual(data, 1);
        });
    });
});