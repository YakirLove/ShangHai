# 本地交付与静态部署

构建使用锁定的本地 Three.js 和 npm lockfile。`npm ci` 后运行 `npm run build`，再运行 `npm run package:release`。

当前本地交付目录为 `release/shanghai-waterfront-0.3.0`，同时生成 `.tar.gz`；目录名跟随 `package.json` 版本。解压后在目录中执行 `node serve.mjs --port 4187`，访问 `http://127.0.0.1:4187`。Node.js 22.12 或更高版本只用于本地预览；线上可直接使用 HTTPS 静态托管。

0.3.0 包含全市 16 区与主要岛屿、43 个搜索目的地、12 个专门制作地标及双向 10 米游戏洞宽隧道。城市块按需加载，整个数据包无需在启动时全部下载。新目的地采用周边道路落点，外围建筑为源轮廓体量与程序补楼，未制作洞体的其他地下道路不开放。范围和限制详见 `docs/CITYWIDE.md`，验收见 `docs/acceptance/0.3.0/REPORT.md`。

本轮只做本地开发，没有上传或切换公网版本。0.1.0、0.1.1 和 0.2.0 历史交付保留；0.2.0 B 区范围 68.66 km²，仍为线上版本。

将目录中的 `index.html`、`assets/`、`data/`、`sources/` 一起发布。Vite base 为相对路径，可以部署在子目录。不要把整个源码、node_modules、Python 虚拟环境或开发服务器公开。

推荐 `assets/` 使用一年 immutable 缓存；HTML、城市 manifest 和 data JSON 使用重新验证。更新时完整替换版本目录，再切换站点根目录；回退时重新指向上一版本。`release-manifest.json` 记录所有交付文件的 SHA256，可用于核对传输完整性。

应用自身的资源全部自托管；游玩不依赖公共地图查询接口。来源数据和许可随包放在 `sources/`，不能移除页面上的 OSM 署名。WebGPU 需要安全上下文：HTTPS 或 localhost。

2026-10-24已发布到新的独立二级域名 https://shanghai.datiaomao.com/，市场入口为 https://apps.datiaomao.com/apps/shanghai-roam/。两者指向同一不可变0.2.0应用产物，市场发布快照为20261024-101402-46d277。后续更新使用根目录.app-market.json和统一发布器；独立域名配置会随刷新、更新与回滚保留。旧0.2.0归档保留其发布前构建与验收快照。
