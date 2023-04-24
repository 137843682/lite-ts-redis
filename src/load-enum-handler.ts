import { EnumLoadHandlerContext, EnumLoadHandlerBase } from 'lite-ts-enum';

import { ICache } from './i-cache';

export class RedisLoadEnumHandler extends EnumLoadHandlerBase {
    public constructor(
        private m_Cache: ICache,
    ) {
        super();
    }

    public async handle(ctx: EnumLoadHandlerContext) {
        ctx.res = await this.m_Cache.get(ctx.enum.name, ctx.areaNo, async () => {
            await this.next?.handle?.(ctx);
            return ctx.res;
        });
    }
}