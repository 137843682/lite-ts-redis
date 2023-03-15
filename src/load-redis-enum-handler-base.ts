import { LoadEnumHandlerBase } from 'lite-ts-enum';

export abstract class LoadRedisEnumHandlerBase extends LoadEnumHandlerBase {
    public abstract flush(name: string): Promise<void>;
}