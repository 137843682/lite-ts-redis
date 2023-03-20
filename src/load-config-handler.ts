import { LoadConfigHandleOption, LoadConfigHandlerBase } from 'lite-ts-config';

import { RedisBase } from './redis-base';

export class LoadRedisConfigHandler extends LoadConfigHandlerBase {
    public constructor(
        private dataKey: string,
        private redis: RedisBase,
    ) {
        super();
    }

    public async handle(opt: LoadConfigHandleOption): Promise<void> {
        opt.areaNo ??= 0;
        const v = await this.redis.hget(`${this.dataKey}:${opt.areaNo}`, opt.name);
        if (v)
            opt.res = JSON.stringify(v);
        else
            await this.next?.handle?.(opt);
    }
}