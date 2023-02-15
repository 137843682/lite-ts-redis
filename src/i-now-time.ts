export interface INowTime {
    isSame(unixTime: number, granularity: string): Promise<boolean>;
    unix(): Promise<number>;
    unixNano(): Promise<number>;
}