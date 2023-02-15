export interface ICache {
    flush(): Promise<void>;
    get<T>(key: string): Promise<T>;
}