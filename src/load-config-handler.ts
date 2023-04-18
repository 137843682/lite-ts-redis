import { ConfigLoadHandlerBase, ConfigLoadHandlerContext } from 'lite-ts-config';

import { ICache } from './i-cache';

export class RedisLoadConfigHandler extends ConfigLoadHandlerBase {
    public constructor(
        private m_Cache: ICache,
    ) {
        super();
    }

    public async handle(ctx: ConfigLoadHandlerContext) {
        ctx.res = await this.m_Cache.get(ctx.name, ctx.areaNo, async () => {
            await this.next?.handle?.(ctx);
            return ctx.res;
        });
    }
}