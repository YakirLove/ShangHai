# 上海漫游 0.2.0：离线加载与阿里云发布记录

2026-10-24，B 区版本已发布到新的独立二级域名 **[shanghai.datiaomao.com](https://shanghai.datiaomao.com/)**，HTTPS 已启用。原有站点及其应用版本保留。

## 离线加载实测

离线包解压后，通过包内的本地静态服务打开，本机从导航开始到可操作约 **2–4 秒**；三次中位数 **2.31 秒**。

| 次数 | 导航到可操作 | 应用内部启动耗时 |
| --- | ---: | ---: |
| 1 | 3.93 秒 | 2.26 秒 |
| 2 | 2.31 秒 | 2.12 秒 |
| 3 | 1.84 秒 | 1.65 秒 |

设备为 Apple M2 Pro、16 GB 内存，Tabbit 1.18.21.0 / Chromium 154，WebGPU、中档画质，实际渲染尺寸 1920×1080。每次清理该站点存储并绕过 HTTP 缓存，经 localhost 读取未压缩静态资源，不施加网络限速；已有浏览器及 GPU 驱动着色器缓存保留。因此，这不是全新系统或首次安装浏览器的测量。

计时不包含下载、解压和启动本地服务。它代表本机运行离线包的结果，不代表手机或内嵌 WebView 的耗时。地图、地标及运行资源已随包提供，游玩无需在线地图查询服务；需要使用本地 HTTP 服务打开，以满足模块加载和 WebGPU 安全上下文要求。

离线包为 [shanghai-waterfront-0.2.0.tar.gz](../../../release/shanghai-waterfront-0.2.0.tar.gz)，4,711,819 字节。解压后进入目录执行：

```sh
node serve.mjs --port 4187
```

然后访问 `http://127.0.0.1:4187`。完整启动条件见 [部署说明](../../deployment.md)。原始三次数据、启动阶段和资源耗时见 [offline-startup.json](offline-startup.json)。

## 发布结果

| 项目 | 结果 |
| --- | --- |
| 新独立入口 | https://shanghai.datiaomao.com/ |
| 市场入口 | https://apps.datiaomao.com/apps/shanghai-roam/ |
| 应用版本 | 0.2.0，B 区 68.66 km²、12 地标、19 个搜索目的地、双向 10 米游戏洞宽 |
| 发布快照 | `20261024-101402-46d277`，状态 `published` |
| 服务器 | 阿里云既有服务器，复用授权的 `aliyun-study` 连接 |
| HTTPS | 独立域名证书有效，当前到期时间 2027-01-22 01:14:18 UTC，复用服务器 Certbot 续期机制 |
| 资源 | 325 个原始运行文件，与此前验收构建逐文件一致；原始总量约 16.6 MB |
| 公网传输 | 对全部 325 个文件发起 gzip 请求，累计传输 3,600,557 字节，解压后 SHA-256 全部一致 |

新域名使用已拥有的 `datiaomao.com` 下的新独立二级域名。未替换旧入口，也未购买新的付费根域名。新域名与市场入口均指向同一应用版本。域名绑定写入发布器的私有版本元数据，后续刷新、更新与回滚会保留对应绑定。

公网另取得一次从导航到可操作 **6.96 秒**的样本。该样本使用当时的正常网络，渲染尺寸为 1728×972，且与完整性下载检查并发进行；它只能说明该次公网成功启动，不能作为独立的网络性能基准，也不与上述离线时间直接比较。详见 [public-startup.json](public-startup.json)。

## 本次验证

| 检查 | 结果与证据 |
| --- | --- |
| 公网资源完整性 | 325 个文件逐项下载、解压、核对哈希通过；私有路径与不存在的资源返回拒绝或不存在。[public-integrity.json](public-integrity.json) |
| 公网实际运行 | WebGPU 启动成功；步行、汽车、自行车、直升机均通过真实键盘移动和相机检查；搜索静安寺可到达，搜索框输入不会触发驾驶。[public-interactions.json](public-interactions.json) |
| 昼夜与隧道 | 白天、黄昏、夜间切换通过；实际驾车进入延安东路隧道至高度 −3.13 米，路线资源就绪，地下切换其他模式受到预期限制。该项为发布后冒烟检查，完整跨江验收保留于原版本报告。 |
| 双入口 | 新独立域名及市场子路径均可启动；最终浏览器保留在新域名，控制输入、缓存与视口覆盖已恢复。[final-browser-state.json](final-browser-state.json) |
| 发布器验证 | 22 项单元测试通过，覆盖域名元数据、更新与回滚、非法或保留域名、跨应用域名冲突。[publisher-validation.json](publisher-validation.json) |
| 公网探针 | 46 项检查通过，涵盖新应用市场入口与已有服务。[market-public-checks.json](market-public-checks.json) |
| 旧站点保护 | 原有五个应用版本、五份其他 Nginx 配置哈希、容器状态和旧链接未改变。[preservation-check.json](preservation-check.json) |

首个隧道测试夹具曾在地面洞口等待“已经地下”的条件，导致等待超时；检查发现路线和城市块均已就绪。将夹具条件改为注册的隧道路面后，继续真实驾驶进入地下并完成检查。产品代码未因该夹具问题修改，诊断记录保留于 [public-interactions-entry-wait-diagnostic.json](public-interactions-entry-wait-diagnostic.json)。

本次仅增加发布配置、应用市场图标封面、独立域名发布能力和文档，未修改游戏运行代码。此前的功能、跨江、性能和稳定性验收见 [0.2.0 验收记录](../../acceptance/0.2.0/REPORT.md)；本次发布成功不替代用户对画风的最终评价。

## 记录与清理

- [发布记录](release-record.json)、[证书记录](domain-certificate.json)、[发布资源 SHA-256](public-payload-sha256.json)、[机器可读汇总](summary.json)。
- 保留服务器成功发布快照、不可变应用版本、证书签发审计，以及原 0.2.0 静态包与源码包，支持追溯和回滚。
- 已删除本次两个本地 `.build` 暂存目录和已核验的服务器上传暂存副本；已停止本次临时 4192 服务。原有 4187、4190 服务保留。见 [本地清理](local-cleanup.json)、[服务器清理](remote-cleanup.json)。
- 浏览器验证任务已正常结束，保留游戏标签页，未强制清理其他标签。

原归档校验值未变：

```text
shanghai-waterfront-0.2.0.tar.gz
ea4cc18cf9a489abdef0906131403805aef5bd7011aaeb57dc21522a9e842780

shanghai-waterfront-0.2.0-source.tar.gz
7b6b211f4674cc9a19e40a96bd63724c6ad4835808805cc939b54de9a3a12ad3
```
