export interface IMutex {
    lock(opt?: any): Promise<() => Promise<void>>;
}