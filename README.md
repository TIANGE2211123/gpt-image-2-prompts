# GPT Image 2 (image2) Prompts — 50 Curated

> 50 条针对 OpenAI **gpt-image-2**（ChatGPT Images 2.0，2026-04-21 发布）的即拿即用提示词，覆盖海报、UI、电商、信息图、漫画、游戏截图、商业广告等高频场景。

## 文件

- [`gpt_image_2_prompts.json`](./gpt_image_2_prompts.json) — 主数据文件（推荐使用）
- [`img2img_prompts.json`](./img2img_prompts.json) — 同样内容的兼容副本

## JSON 结构

```jsonc
{
  "meta": {
    "title": "...",
    "model": "gpt-image-2",
    "count": 50,
    "categories": [...],
    "core_tips": [...],
    "sources": [...]
  },
  "prompts": [
    {
      "id": 1,
      "title": "...",
      "category": "poster_typography",
      "tags": ["..."],
      "aspect_ratio": "2:3",
      "prompt": "可直接复制到 ChatGPT 使用的完整提示词"
    }
  ]
}
```

## 13 个分类

`photorealistic_portrait` · `amateur_realistic` · `poster_typography` · `ui_mockup` · `product_photography` · `infographic_diagram` · `logo_branding` · `ad_creative` · `comic_manga` · `game_screenshot` · `merch_collectible` · `chinese_commercial` · `illustration_style`

## 使用建议

1. 直接把 `prompt` 字段贴到 ChatGPT，附上对应的 `aspect_ratio`。
2. 复杂排版或中文场景建议切到 **Thinking 模式**（Plus / Pro）。
3. 图中文字一律用英文双引号 `"..."` 包住，渲染准确率 >95%。
4. 二次编辑时显式重申不变项（"same character, same outfit, same lighting"）防止漂移。

## Raw 直链

```
https://raw.githubusercontent.com/SHUJILAI/img2img-prompts/main/gpt_image_2_prompts.json
```
