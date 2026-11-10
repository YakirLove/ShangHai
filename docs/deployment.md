# 本地交付与静态部署

## 当前线上

上海漫游0.3.4已于2026-11-10更新至原独立域名[shanghai.datiaomao.com](https://shanghai.datiaomao.com/)。市场入口为[apps.datiaomao.com/apps/shanghai-roam/](https://apps.datiaomao.com/apps/shanghai-roam/)，两者共用同一不可变运行产物。

- 应用ID：`shanghai-roam`。
- 发布快照／应用版本目录：`20261110-091445-268583`。
- 运行目录：`/var/www/app-market/app-releases/shanghai-roam/20261110-091445-268583`。
- 上一成功版本：`20261109-175451-d7b8d3`（应用0.3.3），保留用于回滚。
- 发布和验证证据：[本轮报告](deployment/2026-11-10-0.3.4/REPORT.md)。

0.3.2包含全市16区、1200米飞行、410个地铁站代表入口、实际启动进度、线路/区域/类型组合筛选、地图缩放与选点飞行。既有双向10米游戏洞宽隧道保留。地铁覆盖1–18号线及浦江线，不把它表述为新增的完整实时运营线路数据。普通建筑和部分入口存在视觉估算，范围见[CITYWIDE.md](CITYWIDE.md)、[FLIGHT-METRO.md](FLIGHT-METRO.md)。

0.3.3在此基础上修复手机端布局：小地图、速度面板和模式切换分区显示；场景设置折叠；地图改为可滚动单栏并保留关闭入口；隐藏界面后可点击恢复。适配安全区和动态视口，触屏打开地图时不自动聚焦搜索框。

0.3.4补齐手机移动入口：左下圆形方向盘支持WASD和斜向拖动，右侧提供加速、步行跳跃及飞行升降。触摸取消、打开地图、切换模式和屏幕旋转都会释放触屏输入。

## 本地包

构建使用锁定的本地Three.js和npm lockfile：`npm ci`、`npm run build`、`npm run package:release`。历史运行包目录为`release/shanghai-waterfront-0.3.2`，同时保留`.tar.gz`；解压后用Node.js22.12+执行`node serve.mjs --port 4187`，访问http://127.0.0.1:4187。本轮0.3.4通过统一发布器直接构建运行产物，线上使用HTTPS静态托管，无需Node服务。

0.2.0、0.3.0、0.3.1及0.3.2既有本地归档保留，作为各自验收时的固定快照。0.3.4运行产物与本轮本地验收的dist逐文件比对。验收媒体与后续发布证据在工程docs目录单独交付。

## 日常发布

根目录`.app-market.json`固定应用ID、相对Vite资源路径和既有独立域名。按统一项目`/Users/wuyanji/Desktop/编程/app-market/AGENTS.md`与发布手册，依次执行inventory、publish --dry-run、publish及公网探针；不得手动切换旧current链接。发布器仅导出运行产物，源码、私有配置、依赖、测试和部署记录不进入公网目录。

运行产物必须同时包含`index.html`、`boot-manifest.json`、`assets/`和`data/`，包括`data/metro.json`。启动清单记录同版程序和3份数据的解码字节大小；完整版本发布后再原子切换，不能单独替换地图或程序。健康检查包含启动清单、city.json、manifest.json和metro.json。

HTML、boot-manifest和JSON使用`max-age=0, must-revalidate`，避免新旧版本混用；文本资源提供gzip，进度按解码后的真实字节计数。资源全部自托管，游玩不依赖公共地图查询API。保留页面OSM署名及来源许可说明。WebGPU需要HTTPS或localhost安全上下文。

## 回滚

使用统一发布器对`shanghai-roam`回滚至已经核实的成功版本，先预演再执行；上一成功版本为`20261109-175451-d7b8d3`（0.3.3），更早的成功版本也继续保留。单应用回滚生成新市场快照，其他应用保持各自当前版本。完整命令和恢复流程见统一项目docs/deployment.md。本次沿用已有域名和证书。
