import { LoadEnumHandlerContext, LoadEnumHandlerBase } from 'lite-ts-enum';

import { ICache } from './i-cache';

export class LoadRedisCacheEnumHandler extends LoadEnumHandlerBase {
    public constructor(
        private m_Cache: ICache,
    ) {
        super();
    }

    public async handle(opt: LoadEnumHandlerContext) {
        opt.res = await this.m_Cache.get(opt.enum.name, opt.areaNo, async () => {
            await this.next?.handle?.(opt);
            return opt.res;
        });
    }
}