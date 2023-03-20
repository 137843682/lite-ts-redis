export interface ICache {
    flush(name: string, areaNo?: number): Promise<void>;
}