import { ConfigLoadHandlerBase, ConfigLoadHandlerContext } from 'lite-ts-config';

import { ICache } from './i-cache';

export class LoadRedisCacheConfigHandler extends ConfigLoadHandlerBase {
    public constructor(
        private m_Cache: ICache,
    ) {
        super();
    }

    public async handle(opt: ConfigLoadHandlerContext) {
        opt.res = await this.m_Cache.get(opt.name, opt.areaNo, async () => {
            await this.next?.handle?.(opt);
            return opt.res;
        });
    }
}