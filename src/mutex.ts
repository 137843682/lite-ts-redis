import { ThreadBase } from 'lite-ts-thread';

import { ITraceable } from './i-traceable';
import { IMutex, IMutexOption } from './i-mutex';
import { RedisBase } from './redis-base';
import { TracerWrapper } from './tracer-wrapper';

export interface IRedisMutexOption extends IMutexOption {
    timeoutSeconds?: number;
    tryCount?: number;
    sleepRange?: [number, number];
}

export class CustomError extends Error {
    public constructor(public code: number) {
        super('');
    }
}

export class RedisMutex implements IMutex, ITraceable<IMutex> {
    public static waitLockErrorCode = 507;

    public constructor(
        private m_Redis: RedisBase,
        private m_Thread: ThreadBase,
    ) { }

    public async lock(opt: IRedisMutexOption) {
        if (opt.timeoutSeconds) {
            const ok = await this.m_Redis.set(opt.key, 'ok', 'ex', opt.timeoutSeconds, 'nx');
            return ok ? async () => {
                await this.m_Redis.del(opt.key);
            } : null;
        }

        opt.sleepRange ??= [100, 300];
        opt.tryCount ??= 50;

        let unlock: () => Promise<void>;
        for (let i = 0; i < opt.tryCount; i++) {
            unlock = await this.lock({
                key: opt.key,
                timeoutSeconds: 10
            });
            if (unlock)
                break;

            await this.m_Thread.sleepRange(opt.sleepRange[0], opt.sleepRange[1]);
        }

        if (!unlock)
            throw new CustomError(RedisMutex.waitLockErrorCode);

        return unlock;
    }

    public withTrace(parentSpan: any) {
        return parentSpan ? new RedisMutex(
            new TracerWrapper(this.m_Redis).withTrace(parentSpan),
            this.m_Thread,
        ) : this;
    }
}
