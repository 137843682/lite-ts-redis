import { strictEqual } from 'assert';
import { EnumLoadHandlerContext } from 'lite-ts-enum';
import { Mock, mockAny } from 'lite-ts-mock';

import { RedisEnumLoadHandler as Self } from './enum-load-handler';
import { ICache } from './i-cache';

describe('src/enum-load-handler.ts', () => {
    describe('.handle(opt: EnumLoadHandlerContext)', () => {
        it('ok', async () => {
            const cacheMock = new Mock<ICache>();
            const self = new Self(cacheMock.actual);

            cacheMock.expectReturn(
                r => r.get('t', 0, mockAny),
                1
            );

            const ctx: EnumLoadHandlerContext = {
                app: 'app',
                enum: {
                    name: 't'
                } as any,
                areaNo: 0,
            };
            await self.handle(ctx);
            strictEqual(ctx.res, 1);
        });
    });
});