/**
 * 缓存抽象类
 */
export abstract class CacheBase {
    public abstract flush(name: string, areaNo?: number): Promise<void>;

    public abstract get(name: string, areaNo: number, loadFunc: () => Promise<any>): Promise<any>;
}