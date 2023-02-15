export interface IMutexOption {
    key: string;
}

export interface IMutex {
    lock(opt: IMutexOption): Promise<() => Promise<void>>;
}