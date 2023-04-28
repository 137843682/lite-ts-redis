/**
 * 缓存接口
 * 
 * @deprecated 请使用 CacheBase 替代 ICache
 */
export interface ICache {
    flush(name: string, areaNo?: number): Promise<void>;

    get(name: string, areaNo: number, loadFunc: () => Promise<any>): Promise<any>;
}