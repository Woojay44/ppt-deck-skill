# ppt-deck-skill

通用 PPT 制作 skill（`ppt-deck`）的维护项目。以 [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) 为渲染引擎（原样调用、不修改），在其上加：场景预设、分阶段确认流程、内容和视觉质量规则（来自真实项目的用户反馈）、PowerPoint 实渲染逐页 QA、Word 讲稿和准备清单生成器、可选的标志设计步骤。

第一个真实测试用例是 2026-10 的一次大创结题答辩，见 `ppt-deck/references/feedback-log.md` 和 `ppt-deck/tests/cases.md`。

## 目录结构

```
ppt-deck/                skill 本体（通过目录联接装到 ~/.claude/skills/ppt-deck）
  SKILL.md               入口：硬规则、流程总览、参考文件索引
  references/            场景预设、引擎地图、流程、内容规则、设计规则、QA、配套文档、标志、反馈日志、安装说明
  scripts/               render_pptx.ps1、qa_pptx.py、selftest.py、embed_logo.py、docgen/（Word 生成）等
  templates/             大纲模板、QA 记录模板、讲稿与准备清单的完整实例
  tests/                 测试用例、自检用的 3 页样例 SVG
docs/CHANGELOG.md        版本更新记录
tools/package.py         打包成 dist/ppt-deck-<版本>.zip
```

## 依赖与安装

见 [ppt-deck/references/setup.md](ppt-deck/references/setup.md)。简要步骤：

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r $env:USERPROFILE\.claude\skills\ppt-master\requirements.txt -r requirements.txt
cd ppt-deck\scripts\docgen; npm install; cd ..\..\..
New-Item -ItemType Junction -Path $env:USERPROFILE\.claude\skills\ppt-deck -Target D:\Project-claude\ppt-deck-skill\ppt-deck   # 目录联接，不需要管理员
.venv\Scripts\python ppt-deck\scripts\selftest.py     # 自检：依赖、引擎、导出、QA、渲染、Word
```

## 怎么改进这个 skill

1. 用它做一份 PPT，记下用户的每条修改意见（包括用户自己动手改了交付物的地方）。
2. 把意见提炼成规则，追加到 `ppt-deck/references/feedback-log.md`，并改对应的规则文件。
3. 跑 `selftest.py`；对照 `tests/cases.md` 检查。
4. 在 `docs/CHANGELOG.md` 记一笔，提交 git。

## 打包

```powershell
.venv\Scripts\python tools\package.py v1      # → dist/ppt-deck-v1.zip
```

## 许可证

[MIT](LICENSE)。ppt-master 引擎有自己的 MIT 许可证和完整性检查，不包含在本仓库里。
