export interface ICache {
    flush(name: string, areaNo?: number): Promise<void>;

    get(name: string, areaNo: number, loadFunc: () => Promise<any>): Promise<any>;
}