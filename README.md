# 文件操作

![Version](https://img.shields.io/badge/version-1.1.0-green.svg)

## 安装
```
npm install lite-ts-fs
```

## 使用

```typescript
import { FileFactory } from 'lite-ts-fs';

const factory = new FileFactory();
const file = await factory.buildFile('./test.txt');
await file.readString(); // 读取文件内容

const dir = await factory.buildDirectory('./test');
await dir.create(true); // 创建文件，参数为true时递归创建
```
