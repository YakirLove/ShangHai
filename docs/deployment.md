# 本地交付与静态部署

## 当前线上

上海漫游0.3.2已于2026-10-24更新至原独立域名[shanghai.datiaomao.com](https://shanghai.datiaomao.com/)。市场入口为[apps.datiaomao.com/apps/shanghai-roam/](https://apps.datiaomao.com/apps/shanghai-roam/)，两者共用同一不可变运行产物。

- 应用ID：`shanghai-roam`。
- 发布快照／应用版本目录：`20261024-220216-6a4aab`。
- 运行目录：`/var/www/app-market/app-releases/shanghai-roam/20261024-220216-6a4aab`。
- 上一成功版本：`20261024-101402-46d277`（应用0.2.0），保留用于回滚。
- 发布和验证证据：[本轮报告](deployment/2026-10-24-0.3.2/REPORT.md)。

0.3.2包含全市16区、1200米飞行、410个地铁站代表入口、实际启动进度、线路/区域/类型组合筛选、地图缩放与选点飞行。既有双向10米游戏洞宽隧道保留。地铁覆盖1–18号线及浦江线，不把它表述为新增的完整实时运营线路数据。普通建筑和部分入口存在视觉估算，范围见[CITYWIDE.md](CITYWIDE.md)、[FLIGHT-METRO.md](FLIGHT-METRO.md)。

## 本地包

构建使用锁定的本地Three.js和npm lockfile：`npm ci`、`npm run build`、`npm run package:release`。当前目录为`release/shanghai-waterfront-0.3.2`，同时生成`.tar.gz`；解压后用Node.js22.12+执行`node serve.mjs --port 4187`，访问http://127.0.0.1:4187。线上使用HTTPS静态托管，无需Node服务。

0.2.0、0.3.0、0.3.1及0.3.2既有本地归档保留。0.3.2源码/运行归档是此前本地验收的固定快照，本次发布直接比对其运行构建，不重写旧归档。验收媒体与后续发布证据在工程docs目录单独交付。

## 日常发布

根目录`.app-market.json`固定应用ID、相对Vite资源路径和既有独立域名。按统一项目`/Users/wuyanji/Desktop/编程/app-market/AGENTS.md`与发布手册，依次执行inventory、publish --dry-run、publish及公网探针；不得手动切换旧current链接。发布器仅导出运行产物，源码、私有配置、依赖、测试和部署记录不进入公网目录。

运行产物必须同时包含`index.html`、`boot-manifest.json`、`assets/`和`data/`，包括`data/metro.json`。启动清单记录同版程序和3份数据的解码字节大小；完整版本发布后再原子切换，不能单独替换地图或程序。健康检查包含启动清单、city.json、manifest.json和metro.json。

HTML、boot-manifest和JSON使用`max-age=0, must-revalidate`，避免新旧版本混用；文本资源提供gzip，进度按解码后的真实字节计数。资源全部自托管，游玩不依赖公共地图查询API。保留页面OSM署名及来源许可说明。WebGPU需要HTTPS或localhost安全上下文。

## 回滚

使用统一发布器对`shanghai-roam`回滚至已经核实的成功版本，先预演再执行；当前可回滚至`20261024-101402-46d277`。单应用回滚生成新市场快照，其他应用保持各自当前版本。完整命令和恢复流程见统一项目docs/deployment.md。本次未重新申请域名或证书。
