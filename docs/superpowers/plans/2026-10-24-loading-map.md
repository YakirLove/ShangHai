# 启动进度与地图筛选 Implementation Plan

> 当前Agent使用superpowers:executing-plans逐项实现，不委派实现；收尾作一次独立只读审查。

**Goal:** 启动展示实际进度，地图支持线路/区域/类型筛选、可用缩放和选点飞行。
**Architecture:** 独立进度状态与读取模块、小型bootstrap和构建清单；独立地图地点索引/筛选/聚合模块，地图负责UI，主流程负责原子抵达。
**Tech Stack:** Three.js/WebGPU、Vite、原生JavaScript、Node test、Tabbit。
**Spec:** docs/superpowers/specs/2026-10-24-loading-map-design.md

## Global Constraints
- 本地0.3.2，保留0.3.1归档；不修改地理源和站点入口。
- 不用计时器假增进度；未知长度/显卡编译不能显示伪造剩余时间；首帧就绪之前不能100%。
- 地铁换乘不重复建站；类型/线路/区域筛选与列表和地图一致。
- 加载失败和迟到目标不改变当前位置，地下仍只允许汽车模式。

## Review Focus
- gzip或无Content-Length时以固定资源清单大小计读取字节；错误/截断响应不能误报完成。
- 密集点与相同坐标仍能通过组内列表选择，缩放按钮和滚轮使用实际视口比例。
- 区域筛选按多边形归属，包含边界；无结果时有恢复操作。
- 点击列表只选择，显式飞行才改变交通模式；连续选择不会被旧请求覆盖。
- 地图按钮、筛选表单和搜索输入不向驾驶/飞行传播键盘操作。

### Task 1: 可计量启动
- [x] 新增tests/loading-progress.test.mjs，先验证字节进度、未知长度、失败与100%门槛失败。
- [x] js/loading-progress.js、js/loading-ui.js、js/bootstrap.js；vite.config.js生成boot-manifest.json；tools/serve.mjs提供长度。
- [x] 主流程与城市场景按实际阶段/数量上报、让出UI帧；首帧完成后关闭加载。
- [x] Node测试及构建通过，浏览器限速/失败查看真实数值与重试。

### Task 2: 地图筛选和缩放
- [x] tests/map-catalog.test.mjs及map-view.test.mjs先失败：地区、换乘线路、组合搜索、聚合不丢点、实际比例缩放。
- [x] js/map-catalog.js地点元数据/筛选/聚合；js/map-view.js适配宽高比、结果范围和街道缩放。
- [x] js/map.js、index.html、style.css实现筛选、列表、详情、聚合及缩放控件。
- [x] 验证默认不过密、19线/16区、空结果、重叠点和输入隔离。

### Task 3: 飞往目的地与交付
- [x] 为显式交通模式的异步抵达及新旧请求竞态补测试，保持失败前原交通方式和位置。
- [x] js/main.js接入飞到上空和普通前往，保留隧道限制与加载检查。
- [x] Node全套、构建和Tabbit实际启动、筛选选点/飞行/普通前往及模式回归通过。
- [x] 更新说明、版本、静态包、截图与验收报告；清理临时文件，保留4187服务。

最终证据：docs/acceptance/0.3.2/REPORT.md。64项Node与7项Python通过；源码包独立安装构建后8545个输出一致，独立静态包8608个清单文件与8545个HTTP资源通过，最终构建地图交互和30秒运行检查通过。包内计划为最终验收前的实现快照，完成判定与校验值以项目验收报告和release/DELIVERY-0.3.2.json为准。
