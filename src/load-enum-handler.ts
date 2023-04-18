import { LoadEnumHandlerContext, LoadEnumHandlerBase } from 'lite-ts-enum';

import { ICache } from './i-cache';

export class RedisLoadEnumHandler extends LoadEnumHandlerBase {
    public constructor(
        private m_Cache: ICache,
    ) {
        super();
    }

    public async handle(ctx: LoadEnumHandlerContext) {
        ctx.res = await this.m_Cache.get(ctx.enum.name, ctx.areaNo, async () => {
            await this.next?.handle?.(ctx);
            return ctx.res;
        });
    }
}