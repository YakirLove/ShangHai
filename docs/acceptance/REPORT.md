# 上海漫游 0.1.0 验收报告

本地可玩版和静态包已交付，下面列出的核心玩法、跨江、加载、性能和稳定性检查已执行。**完整合同仍有保留：源缓存缺失普通道路方向与桥隧层级；最终画风与城市辨识度需用户按截图做人工确认。** 没有把这些项目标为已核验。

## 环境与版本

MacBook Pro／Apple M2 Pro／16 GB，macOS27.0.1，Tabbit1.18.21.0（Chromium154.0.8037.58）。WebGPU、中档、实际画布1920×1080、renderer DPR=1；全程前台。Node23.11.0，Vite8.3.5，Three.js187dev固定revision。最终构建 index-znyxrDSI.js，SHA256：`7b557160d6a963e1884a89616568482ab11caf33ddbaab563622a8b4b03dc001`。

正式四模式性能、连续运行、六次双向驾驶与资源往返均在上面同一个最终构建执行。最终版本包含完整车体碰撞、地下镜头与加载修复、近处人车池和上海夜景倒影。早期构建与压力／工具中断记录保留在builds和technical-trial，不把它们混入最终通过数字。Tabbit站点缩放90%，通过viewport仿真得到实际1920×1080画布；截图为原生clip输出，没有改图补景。

## 验收逐项结果

| 项目 | 结果和证据 |
|---|---|
| 地理 | 560个源建筑轮廓＋3054个程序补建筑，不能解释为真实唯一楼栋覆盖率。32个控制点，独立ECEF→ENU对照最大0.32m；只针对选定源。[控制点CSV](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/control-points.csv)、[叠合图](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/geography-overlay.svg)、[审计JSON](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/geography.json) |
| 地标 | 8个独立模型，普通楼宇预留排重；16张近远截图，4塔轮廓逐项检查。[视觉检查](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/visual-review.json) |
| 画风 | 6固定机位×白天／黄昏／夜间=18图，复用原站程序立面、玻璃、光照、角色和后处理；差异见下文。最终人工美术确认待用户进行 |
| 双向过江 | 两方向各至少3段完整视频，实际物理控制，无途中位置重设；轨迹包含连续负高程、表面ID与相机位置 |
| 分层／碰撞 | 地面和地下按高度分离；洞壁夹框按真实洞线，车体含后视镜／号牌。[车体夹具](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/vehicle-wall.json)、[地下回归](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/underground-regressions.json) |
| 四模式 | 步行、汽车、骑行、飞行均实际操作超过5分钟，切换、停止与镜头操作通过；非汽车模式禁止在洞中切换 |
| 地图／昼夜 | 8个地标搜索和安全落点、位置标记、三档时间、三相机、输入不驾驶、Escape关闭搜索并归还焦点。[四模式操作录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/four-modes-release.mp4)、[操作与停止记录](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/four-modes-operation.json)、[交互](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/interactions.json)、[落点](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/landings.json)、[键盘](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/map-keyboard.json) |
| 加载异常 | 注入失败保留有效位置，可重试；新跳转优先；显式加载lease、跨界180m碰撞halo与空水域块通过。[跳转回归](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/arrival-regressions.json)、[移动门控](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/loading-gate.json) |
| 性能 | 四模式预热后有效样本均超过300秒，P95≤33.3ms，见下表及原始帧数据 |
| 冷启动 | 50Mbps／80ms RTT、清站点数据且绕过HTTP缓存，导航开始到可操作中位数1.92秒，目标≤15秒。[3次原始记录](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/cold-start.json) |
| 稳定／资源 | 连续33.03分钟，无应用错误、页面隐藏、崩溃、黑屏或控制丢失；2轮预热+10次往返资源检查，见下表 |
| 发布 | 86个文件哈希核对、68个必要HTTP资源成功；游玩无外部请求。[发布审计](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/release-audit.json)、[网络](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/network-audit.json) |
| 测试 | 根目录23/23；固定上游97/97。[上海测试日志](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/tests-shanghai.log)、[上游测试日志](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/tests-upstream.log)、[独立审查与修复](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/code-review.md) |
| 源码复现 | 干净目录npm ci、23项测试、源数据再生成与Vite构建通过，68个运行文件逐字节一致。Python复用已锁定依赖的现有虚拟环境。[复现记录](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/source-reproduction.json)、[日志](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/source-reproduction.log) |

## 帧耗时

性能采样与证据录像分开：汽车排除首10秒预热，其余连续样本超过5分钟；步行先30秒预热，前25秒仅作功能录像。骑行与飞行在从未开启录屏的新页面中预热30秒，再连续采样301秒。每一帧保留原始数值。

| 模式 | 有效采样 | 帧数 | P50 ms | P95 ms | P99 ms | 目标 |
|---|---:|---:|---:|---:|---:|---|
| 汽车 | 360.47 s | 18280 | 16.74 | 31.02 | 81.58 | 通过 |
| 步行 | 301.03 s | 17201 | 16.66 | 22.20 | 45.92 | 通过 |
| 骑行 | 301.03 s | 16492 | 16.67 | 25.49 | 57.38 | 通过 |
| 直升机 | 301.00 s | 26346 | 9.28 | 17.80 | 32.04 | 通过 |

![四模式性能](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/performance.png)

[汽车原始帧](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/car-performance.json)、[person原始帧](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/modes/person.json)、[cyclist原始帧](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/modes/cyclist.json)、[helicopter原始帧](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/modes/helicopter.json)。

高频CDP录屏压力试验曾使夜间长路线P95升至65.04ms；最终西向黄昏的录屏与后台编码并行时P95为47.64ms，**这些结果未作为正式无录屏性能通过依据**。停录屏后10秒窗口回到20.81ms；正式无录屏汽车样本见上表。压力数据和A/B数据保留，后续证据使用每12帧采样的低频录像，不以录像编码帧率代替应用帧率。[压力路线](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/east-2-midnight.json)、[A/B恢复](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recording-cost-recovered.json)、[最终西向录屏轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/west-golden-release.json)。

正式汽车采样时系统同时运行其他开发任务，环境快照保留在[environment-load.json](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/environment-load.json)；没有关闭用户进程，也没有从采样中删除慢帧。P99一并列出，达到P95目标不代表持续60fps。骑行曾在前一个长测会话测得P95 44.04ms未达标，该失败样本和短时对照均保留；没有把降低画质或隐藏人车的诊断结果作为通过依据。后续仅在恢复中档、完整人车和界面后进行新页面无录屏复测。[骑行失败原始帧](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/technical-trial/cyclist-foreground-failed.json)、[短时对照](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/technical-trial/cyclist-ab-notes.json)。

## 连续驾驶证据

路线地理端点均接入地面道路，四处路面接缝高差0m。纵断面／净高是已标记的视觉估算，不是测绘结果。轨迹按约200ms采样；入口菜单只用于开始每次测试，通行中没有调用跳转。

| 记录 | 方向／时段 | 连续时长 | 洞线横向偏离 | 最小相机顶板余量 | 起终点 | 文件 |
|---|---|---:|---:|---:|---|---|
| east-golden-release | 浦西→浦东／黄昏 | 173.95 s | 0.92 m | 2.66 m | 地面驶入／驶出 | [录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/east-golden-release.mp4)／[轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/east-golden-release.json) |
| east-midday-release | 浦西→浦东／白天 | 159.78 s | 0.96 m | 2.66 m | 入口起步 | [录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/east-midday-release.mp4)／[轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/east-midday-release.json) |
| east-midnight-release | 浦西→浦东／夜间 | 159.88 s | 0.92 m | 2.66 m | 入口起步 | [录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/east-midnight-release.mp4)／[轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/east-midnight-release.json) |
| west-golden-release | 浦东→浦西／黄昏 | 240.79 s | 1.45 m | 2.62 m | 地面驶入／驶出 | [录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/west-golden-release.mp4)／[轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/west-golden-release.json) |
| west-midday-release | 浦东→浦西／白天 | 138.56 s | 1.44 m | 2.64 m | 入口起步 | [录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/west-midday-release.mp4)／[轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/west-midday-release.json) |
| west-midnight-release | 浦东→浦西／夜间 | 136.03 s | 1.46 m | 2.63 m | 入口起步 | [录像](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/recordings/west-midnight-release.mp4)／[轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/drives/west-midnight-release.json) |

本表只计最终构建的六段完整录像。黄昏两趟从真实源道路的外侧点起步，使用正常路面采样驶入，再驶出到另一岸地面道路；未预先给车辆指定隧道表面，表面切换的最大单步高差为0.00m。地面连接源道路ID保留在轨迹groundConnection中。

早期west-2-midnight因A/B诊断只录6秒，未计入；验收工具曾因空闲会话到期把页面放到后台，该段长时与不完整驾驶也已排除，之后以保活会话完成正式前台长测。诊断详见[工具中断记录](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/technical-trial/validation-lease-interruption.json)。

![双向轨迹](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/driving-trajectories.png)

## 稳定性与区域往返

最终构建连续33.03分钟、397条5秒资源记录，页面始终前台，应用error/unhandledrejection为0。该序列覆盖正式驾驶和四模式长测，运行没有崩溃或黑屏。早期录屏压力及后台中断在单独文件中披露。

![长时资源](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/stability.png)

完成2次预热后，再完成10次和平饭店—上海中心往返；每次返回相同落点，等待挂载／卸载与GPU提交完成。后5轮资源如下：

| 轮次 | 活跃块 | 几何体 | 顶点属性 | uniform缓冲 | 纹理 | 跟踪GPU资源 |
|---|---:|---:|---:|---:|---:|---:|
| 8 | 22 | 493 | 1331 | 770 | 51 | 157.76 MiB |
| 9 | 22 | 493 | 1331 | 770 | 51 | 157.76 MiB |
| 10 | 22 | 493 | 1331 | 770 | 51 | 157.76 MiB |
| 11 | 22 | 493 | 1331 | 770 | 51 | 157.76 MiB |
| 12 | 22 | 493 | 1331 | 770 | 51 | 157.76 MiB |

![十次往返](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/lifecycle.png)

这些计数反映渲染器跟踪的GPU资源，不等于整个浏览器的显存；JS heap也不代替显存。完整数据：[资源往返](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/lifecycle.json)、[长时序列](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/stability.json)。

## 视觉对照与保留项

- 18张固定机位和16张地标近远景来自同一个最终构建的实际运行；未将概念图当作实现截图。浏览器悬浮控件保留在原图中。
- 东方明珠、扭转的上海中心、顶部开口的环球金融中心、台阶式金茂具有不同轮廓；八地标单独建模并与普通楼宇预留区排重。
- 窗格、玻璃、天空、阴影、角色和后处理沿用固定原站代码；近处已有车辆、行人、路灯、树木和中文路牌。
- 与原站相比，历史建筑细部、街景陈设和普通住宅形制仍较简化；普通楼高和隧道纵断面使用已标记的视觉估算。
- 夜景整体偏暗；江面远处灯光是上海地标的风格化倒影补充，不宣称完整物理反射。
- 这里记录的是实现方的逐项视觉检查，最终画风与城市辨识度尚未得到用户人工验收。
- 环球金融中心近景已退后重拍并逐图检查，完整保留塔顶开口；取景问题已关闭。

![18张固定机位](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/fixed-views-contact.jpg)

![8地标近远景](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/landmarks-contact.jpg)

原站参考图在[reference目录](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/reference)。这次完成了逐项视觉检查和差异记录，用户尚未进行最终人工美术验收。

普通路网方向、原OSM对象ID和完整桥隧层级在选定缓存中缺失；核心隧道按真实缓存端点拼接并通过实际驾驶，但不将这些测试推论为全区交通属性完全真实。普通楼宇估算、简化街墙和地下高程均有来源标记。详见[范围](/Users/wuyanji/Desktop/上海漫游/docs/acceptance/scope.json)及[来源说明](/Users/wuyanji/Desktop/上海漫游/docs/SOURCES.md)。

## 交付与复现

[本地游玩](http://127.0.0.1:4187/)；[静态包](/Users/wuyanji/Desktop/上海漫游/release/shanghai-waterfront-0.1.0.tar.gz)；[完整源码包](/Users/wuyanji/Desktop/上海漫游/release/shanghai-waterfront-0.1.0-source.tar.gz)；[部署说明](/Users/wuyanji/Desktop/上海漫游/docs/deployment.md)。公开上线未执行。

源码中的tests/browser为Tabbit执行程序，tools包含数据构建、地理审计、静态包验证、视频编码和报告绘图；Node和Python依赖分别锁定。无需公共地图API即可游玩。
