export interface IRedisGeo {
    latitude: number;
    longitude: number;
    member: string;
}

export interface IRedisZMember {
    member: string;
    score?: number;
}

export interface IRedisZRangeByLexOption {
    key: string;
    max: number | string;
    min: number | string;
    limit?: {
        count: number;
        offset: number;
    };
}

export interface IRedisZRangeByScoreOption extends IRedisZRangeByLexOption {
    withScores?: boolean;
}

export interface IRedis {
    /**
     * 弹出列表左边项(阻塞)
     * 
     * @param timeout 等待时间
     * @param keys 弹出列表数组
     */
    blpop(timeout: number, ...keys: string[]): Promise<[string, string]>;

    /**
     * 弹出列表右边的项(阻塞)
     * 
     * @param timeout 等待时间
     * @param keys 弹出列表数组
     */
    brpop(timeout: number, ...keys: string[]): Promise<[string, string]>;

    /**
     * 关闭
     */
    close(): void;

    /**
     * 删除
     * 
     * @param key 键
     */
    del(key: string): Promise<void>;

    /**
     * 判断键是否存在
     * 
     * @param key 键
     */
    exists(key: string): Promise<boolean>;

    /**
     * 设置过期时间
     * 
     * @param key 键
     * @param seconds 秒数
     */
    expire(key: string, seconds: number): Promise<void>;

    /**
     * 获取键的字符串
     * 
     * @param key 键
     */
    get(key: string): Promise<string>;

    /**
     * 增加geo
     * 
     * @param key 键
     * @param datas geo数据数组 
     */
    geoadd(key: string, ...datas: IRedisGeo[]): Promise<number>;

    /**
     * 获取坐标
     * 
     * @param key 键
     * @param members 成员
     */
    geopos(key: string, ...members: string[]): Promise<[number, number][]>;

    /**
     * 删除hash字段
     * 
     * @param key 键
     * @param fields 字段
     */
    hdel(key: string, ...fields: string[]): Promise<number>;

    /**
     * 获取hash值
     * 
     * @param key 键
     * @param field 字段
     */
    hget(key: string, field: string): Promise<string>;

    /**
     * 获取hash
     * 
     * @param key 键
     */
    hgetall(key: string): Promise<{ [key: string]: string; }>;

    /**
     * hash长度
     * 
     * @param key 键
     */
    hlen(key: string): Promise<number>;

    /**
     * 获取hash所有键
     * 
     * @param key 键
     */
    hkeys(key: string): Promise<string[]>;

    /**
     * 设置hash字段的值
     * 
     * @param key 键
     * @param field 字段
     * @param value 值
     */
    hset(key: string, field: string, value: string): Promise<void>;

    /**
     * 设置hash不存在的字段的值
     * 
     * @param key 键
     * @param field 字段
     * @param value 值
     */
    hsetnx(key: string, field: string, value: string): Promise<boolean>;

    /**
     * 自增+1
     * 
     * @param key 键
     */
    incr(key: string): Promise<number>;

    /**
     * 自增(+n)
     * 
     * @param key 键
     * @param increment 自增值
     */
    incrBy(key: string, increment: number): Promise<number>;

    /**
     * 查询键
     * 
     * @param pattern 匹配模式
     */
    keys(pattern: string): Promise<string[]>;

    /**
     * 弹出列表左边项
     * 
     * @param key 键
     */
    lpop(key: string): Promise<string>;

    /**
     * 从列表左边插入项
     * 
     * @param key 键
     * @param values 项数组
     */
    lpush(key: string, ...values: string[]): Promise<number>;

    /**
     * 获取列表下标区间的项
     * 
     * @param key 键
     * @param start 开始下标
     * @param stop 结束下标, -1最后一个, -2最后第二个
     */
    lrange(key: string, start: number, stop: number): Promise<string[]>;

    /**
     * 获取多个字符串键的值
     * 
     * @param keys 键数组
     */
    mget(...keys: string[]): Promise<string[]>;

    /**
     * 从列表右边弹出
     * 
     * @param key 键
     */
    rpop(key: string): Promise<string>;

    /**
     * 从列表右边插入
     * 
     * @param key 键
     * @param values 值数组
     */
    rpush(key: string, ...values: string[]): Promise<number>;

    /**
     * 设置字符串键的值
     * 
     * @param key 键
     * @param value 值
     * @param args 扩展参数
     */
    set(key: string, value: string, ...args: any[]): Promise<boolean>;

    /**
     * 获取redis时间
     */
    time(): Promise<[string, string]>;

    /**
     * 获取键的剩余生存时间
     * 
     * @param key 键
     */
    ttl(key: string): Promise<number>;

    /**
     * 添加redis有序集
     * 
     * @param key 键 
     * @param members 成员
     */
    zadd(key: string, members: IRedisZMember[]): Promise<number>;

    /**
     * 返回有序集的成员数量
     * 
     * @param key 键 
     * @param member 成员
     */
    zcard(key: string): Promise<number>;

    /**
     * 统计有序集分值区间内的成员数量
     * 
     * @param key 键 
     * @param min 最小分值（包括等于）
     * @param max 最大分值（包括等于）
     */
    zcount(key: string, min: number, max: number): Promise<number>;

    /**
     * 改变有序集内给定的成员增加相应的分值
     * 
     * @param key 键 
     * @param increment 改变值（可正可负）
     * @param member 成员
     */
    zincrby(key: string, increment: number, member: string): Promise<string>;

    /**
     * 返回两个集合的交集到一个新的有序集
     * 
     * @param key 键 
     * @param args 有序集
     */
    zinterstore(key: string, ...args: string[]): Promise<number>;

    /**
     * 返回有序集合中指定区间内的成员(升序，若相等按字典排)
     * 
     * @param key 键 
     * @param start 区间开始值
     * @param stop 区间结束值
     * @param withScores 选项(是否返回分数)
     */
    zrange(key: string, start: number, stop: number, withScores?: 'WITHSCORES'): Promise<string[]>;

    zrangebylex(opt: IRedisZRangeByLexOption): Promise<string[]>;

    zrangebyscore(opt: IRedisZRangeByScoreOption): Promise<IRedisZMember[]>;

    /**
     * 返回有序集中成员的排名
     *
     * @param key 键 
     * @param member 成员
     */
    zrank(key: string, member: string): Promise<number>;

    /**
     * 移除有序集中的一个或多个成员
     *
     * @param key 键 
     * @param args 成员
     */
    zrem(key: string, ...args: any[]): Promise<number>;

    /**
     * 移除有序集合中指定排名(rank)区间内的所有成员
     *
     * @param key 键 
     * @param start 开始区间
     * @param stop 结尾区间
     */
    zremrangebyrank(key: string, start: number, stop: number): Promise<number>;

    /**
     * 移除有序集中分值介于区间的成员
     *
     * @param key 键 
     * @param min 最小分值（包括等于）
     * @param max 最大分值（包括等于）
     */
    zremrangebyscore(key: string, min: number, max: number): Promise<number>;

    /**
     * 返回有序集中指定区间内的成员(降序)
     *
     * @param key 键 
     * @param start 开始区间（包括等于）
     * @param stop 结束区间（包括等于）
     * @param withScores withScores 选项(是否返回分数)
     */
    zrevrange(key: string, start: number, stop: number, withScores?: 'WITHSCORES'): Promise<string[]>;

    /**
     * 返回有序集合中成员的排名(降序)
     *
     * @param key 键 
     * @param member 成员
     */
    zrevrank(key: string, member: string): Promise<number>;

    /**
     * 返回有序集中成员对应的分值
     *
     * @param key 键 
     * @param member 成员
     */
    zscore(key: string, member: string): Promise<string>;

    /**
     * 用于计算给定的一个或多个有序集的并集，其中给定 key 的数量必须以 numkeys 参数指定，并将该并集(结果集)储存到 destination 目标集合 
     *
     * @param key 键 
     * @param args 有序集
     */
    zunionstore(key: string, ...args: string[]): Promise<number>;
}