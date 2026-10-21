# QA 记录

- 交付文件：`<名称>-vN.pptx`（<页数> 页，含 / 不含讲稿备注）
- 渲染：PowerPoint 实渲染（`scripts/render_pptx.ps1`），结果在 `<项目>/render/vN/`
- 日期：<YYYY-MM-DD>

## 1. 自动检查
| 检查项 | 工具 | 结果 |
|---|---|---|
| SVG 规范、溢出、重叠 | `svg_quality_checker.py --stage final` | <N/N 通过，0 警告> |
| 导出完整性 | `svg_to_pptx.py` postflight | <passed> |
| 字号 ≥ 18pt / 字体 / 备注 | `scripts/qa_pptx.py` | <PASS；小于 18pt 的只有 …> |
| 图表坐标 | `svg_position_calculator.py` | <…> |

## 2. 逐页人工检查
| 页 | 结论 | 修改 |
|---|---|---|
| P1 | <…> | <无 / 改了什么> |

## 3. 数据一致性
| 数字 | 页 | 出处 |
|---|---|---|

## 4. 已知风险
- <不影响交付但用户应知道的事，例如截图和底稿的差异、口径选择>

## 修订记录
| 版本 | 改了什么 | 复查结果 |
|---|---|---|
