# 上海全市本地扩展执行记录

Plan: docs/superpowers/plans/2026-10-24-citywide.md
Spec: docs/superpowers/specs/2026-10-24-citywide-design.md

- Ruling: 用户已要求继续本地开发，沿用当前非 Git 工程，不创建 Git/worktree，不进行线上发布。
- Pre-flight: 数据生成器与 SurfaceProvider / TileLoader / city-scene / map 共用 city/manifest 契约；本次通过 schemaVersion 区分分块场景，旧中心城区数据作为覆盖层。
- Task 1: in progress — 已确认 Geofabrik 全市快照，下载时直连 TLS 失败，正在使用本机已有代理连接。
- Ruling: Geofabrik 域名直连及代理 TLS 均失败，OSM France 同源上海 PBF 镜像 HTTPS 可用，改取该镜像并固定本地原始文件与 SHA-256。运行仍完全离线。
- Data: 全市 PBF 29,630,612 bytes，SHA-256 dd18c877fa0d4c798a3a0d84eccae53aa73238754f7e62a68f79ff9684258706，MD5 与提供方匹配。
- Ruling: 省域 PBF 的部分行政关系引用缺失节点/成员，直接核验发现仅 11 个区可组装；从 OSM France polygon 服务补齐市界及 5 区边界，原始响应和哈希固定保存，不用矩形伪造行政边界。
- Task 2 partial: 两万块加载索引夹具由扫描 1,206,120 次远处 bounds 变为局部查询，12 项 core 测试通过。
- Ruling: 全量解析约 20 万条道路，启动继续只保留核心区道路；外围道路表面与碰撞随城市块注册/移除，全市地图单独保留简化主干路。空海域块用离线内联描述，避免生成数万空文件。
- Coastline fix: 港区/离岸道路不能用来认定海面为陆地，改为 OSM 海岸线左陆右水的方向约定；无路小岛保留。两个地理夹具由失败转为通过。
- Task 1: complete — 16 区、43 目的地，188784道路对象、117575源楼宇体量、456618程序体量；30418逻辑块中8012有独立内容、22406海域内联。启动city.json 7,717,718 bytes，块内容266,232,000 bytes。
- Fixture correction: 原江口点121.90,31.48处于源海岸线内的崇明陆地；改用岛屿岸线以东的122.30,31.35水面控制点，保留判定诊断。
- Browser v1: 本地 WebGPU 启动2.41秒（原生非正式视口）；固定到1920×1080、DPR约1后，24个新增目的地全部到达，地图搜索、输入键盘隔离、缩放、平移与重新定位通过。正式性能尚待最终数据版本测量。
- Review fix: 分块压缩记录遗漏 oneway/directionSource/nodeIds，已增加69个固定源道路控制条目与失败测试；修正为完整保留属性并将正layer道路按高架面表达，正在重建最终数据。市界外改为灰色未建模背景并加入进入门禁。
- Screenshot fixture: 快速连续跳转时原截图比HUD/渲染晚一帧，后续截图等待实际渲染帧和对应路名更新，再覆盖早期快照，避免图名与前一地点不一致。
- Final data: 市界外为灰色背景和禁止进入区域；真实水域9,056.45 km²，几何陆域7148.98 km²（均为源几何口径）。43个目的地、30418逻辑块，运行块内容329,443,848 bytes，1485块包含真实农田图层。城市场景metadata69控制道路保留方向、层级和节点，43项Node测试及2项Python地理测试通过。
- Ramp regression: 浏览器复现步行进入洞口20.00米时，角色仍在2.12m而路面2.011m，开始悬空。已补非汽车坡道门禁和安全落点过滤；门禁仅针对实际开口，地面跨越深层隧道和高架不受影响。新增失败测试后修复，待浏览器专项复测。
- Ramp final: 最新构建 `index-DDTlA7QO.js` 浏览器复测通过；步行在入口前被阻止，汽车可进入 yanan-1 坡道，应用错误为空。Node 44/44、Python 3/3 通过。
- Startup final: 清站点存储并绕过 HTTP 缓存，本地三次 2109.71/1501.70/1492.84ms；50Mbps、80ms RTT 三次4309.48/4359.01/4285.81ms。浏览器/GPU 着色器缓存保留。中档、1920×1080、WebGPU。
- Long acceptance: 已开始四模式各30秒预热+301秒采样，随后双向各三次连续跨江、录屏与30分钟稳定性。首次夹具调用 bringToFront 与任务保留焦点策略冲突，应用无异常；已改为断言当前页面可见，诊断保留。
- First long run: 四模式各301秒、双向6次过江与37.708分钟可见页面稳定性通过；后续跨区往返检测出每轮48个uniform buffer增长，未将该构建判定为交付通过。
- Resource fix: 定位到普通Mesh仅geometry.dispose未触发WebGPU RenderObject释放。补所有网格对象dispose事件，保留共享材质；新增失败测试后修复，45/45单元测试通过。最新构建index-CkwP2jLv.js，10次实测往返最后五轮uniformBuffers=480、总GPU计数162868391 bytes保持一致。
- Final preflight: 新构建43目的地、129次飞行转地面模式落点、真实请求失败/重试/迟到请求、移动加载门禁、43名称搜索及中文区名搜索、地图缩放/拖动/定位和真实wasd1234输入隔离均通过。新构建本地三次2155.04/1738.86/1601.17ms；50Mbps/80ms三次4207.925/4278.375/4275.025ms。已开始最终构建完整长时回归。
