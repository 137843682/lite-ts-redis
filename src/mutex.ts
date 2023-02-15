import { ThreadBase } from 'lite-ts-thread';

import { IMutex } from './i-mutex';
import { IRedis } from './i-redis';
import { ITraceable } from './i-traceable';
import { RedisMutexOption } from './mutex-option';
import { TracerStrategy } from './tracer-strategy';

export class RedisMutex implements IMutex, ITraceable<IMutex> {
    public static errWaitLock: Error;

    public constructor(
        private m_Redis: IRedis,
        private m_Thread: ThreadBase,
    ) { }

    public async lock(opt: RedisMutexOption) {
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
            throw RedisMutex.errWaitLock;

        return unlock;
    }

    public withTrace(parentSpan: any) {
        return parentSpan ? new RedisMutex(
            new TracerStrategy(this.m_Redis).withTrace(parentSpan),
            this.m_Thread,
        ) : this;
    }
}
