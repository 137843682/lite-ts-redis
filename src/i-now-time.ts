/**
 * 当前时间接口
 */
export interface INowTime {
    /**
     * 是否同一天
     * 
     * @param unixTime 其他unix时间
     */
    isSameDayUnix(unixTime: number): Promise<boolean>;

    /**
     * 时间戳, 单位: 秒
     */
    unix(): Promise<number>;

    /**
     * 时间戳, 单位: 纳秒
     */
    unixNano(): Promise<number>;
}