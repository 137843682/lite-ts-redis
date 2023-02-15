export interface ICache {

    /**
     * 清空
     * 
     * @example
     * ```typescript
     *  const cache: ICache;
     *  await cache.flush();
     * ```
     */
    flush(): Promise<void>;

    /**
     * 获取
     * 
     * @example
     * ```typescript
     *  const cache: CacheBase;
     *  const res = await cache.get<T>('key');
     * ```
     */
    get<T>(key: string): Promise<T>;
}