import { strictEqual } from 'assert';
import { ConfigLoadHandlerContext } from 'lite-ts-config';
import { Mock, mockAny } from 'lite-ts-mock';

import { RedisConfigLoadHandler as Self } from './config-load-handler';
import { ICache } from './i-cache';

describe('src/config-load-handler.ts', () => {
    describe('.handle(ctx: ConfigLoadHandlerContext)', () => {
        it('ok', async () => {
            const cacheMock = new Mock<ICache>();
            const self = new Self(cacheMock.actual);

            cacheMock.expectReturn(
                r => r.get('name', 0, mockAny),
                1
            );

            const opt: ConfigLoadHandlerContext = {
                name: 'name',
                areaNo: 0,
            };
            await self.handle(opt);

            strictEqual(opt.res, 1);
        });
    });
});