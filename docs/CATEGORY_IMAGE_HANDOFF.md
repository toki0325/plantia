# カテゴリ別商品画像 引き渡し仕様書

にこベビー（niko-baby）互換 EC サイト向け。**Python 不要**。  
カテゴリ slug を指定すると、そのカテゴリページ・商品詳細に必要な画像一式を納品できるようにするための仕様です。

---

## 1. この文書の目的

| 項目 | 内容 |
|------|------|
| **読者** | 画像生成側・別リポジトリの開発者 |
| **前提** | Next.js サイトは niko-baby 初期版と同様に **UI だけ完成**している |
| **やること** | カテゴリを指定 → サムネ＋詳細用画像を所定パスに配置 → `products.ts` と突合 |
| **やらないこと** | Python スクレイピング、外部 EC 連携（任意） |

**完成の定義（Acceptance Criteria）**

- `/category/{slug}` に商品カードのサムネが **すべて表示**される（欠け・404 なし）
- `/products/{id}` のメイン画像・サムネ切替が **すべて表示**される
- 画像は **1:1（正方形）**、`object-contain` でトリミングされて見切れない
- `products.ts` の `images[]` と `public/images/` のファイルが **1:1 対応**

---

## 2. サイト側の仕組み（受け側が知っておくこと）

### 2.1 カテゴリ一覧

`lib/data/categories.ts` で定義。slug は **固定**。

| slug | 名称 | MVP 推奨商品数 | MVP 推奨画像スロット数 |
|------|------|---------------|----------------------|
| `babywear` | ベビー服/新生児服 | 4 | 4 |
| `innerwear` | インナー/下着/ルームウェア | 3 | 3 |
| `shoes-accessories` | シューズ/靴下/帽子/小物 | 3 | 3 |
| `carry` | 抱っこひも/おくるみ | 3 | 3 |
| `furniture` | ベビー寝具/家具 | 3 | 3 |
| `feeding` | 授乳/離乳食用品 | 3 | 3 |
| `care` | ベビーケア用品/おむつ/お風呂 | 3 | 3 |
| `toys-memorial` | おもちゃ/絵本/メモリアル | 3 | 3 |
| `outlet` | アウトレット/セール | 0〜3 | 3 |

> `outlet` は `isSale: true` の商品を集める特殊カテゴリ。初期は空でも可。

### 2.2 商品データ型

```typescript
// lib/data/types.ts（抜粋）
export type Product = {
  id: string;              // 商品 ID（後述）
  name: string;
  price: number;
  categorySlug: string;    // 上表の slug と一致
  images: string[];        // Web パス。先頭 = サムネ
  stages: StageSlug[];     // "nenne" | "kubisuwari" | "haihai" | "anyo"
  gender: "girl" | "boy" | "unisex";
  sizes: ("50"|"60"|"70"|"80"|"90")[];
  colors: string[];
  rating: number;
  reviewCount: number;
  description: string;
  material: string;
  care: string;
  reviews: [];
};
```

### 2.3 UI が画像を参照する箇所

| 画面 | コンポーネント | 使う画像 |
|------|--------------|---------|
| カテゴリ一覧 `/category/[slug]` | `ProductCard` | `product.images[0]` のみ |
| 商品詳細 `/products/[id]` | `ProductGallery` | `product.images[]` 全件 |
| ランキング・新着・特集 | `ProductCard` | `product.images[0]` のみ |

**ルール**

- `images[0]` = **一覧サムネ**（必須）
- `images[1..]` = **詳細ギャラリー**（任意。2枚以上でサムネ切替 UI が出る）
- パスは **`/images/...` から始まる Web パス**（`public/` は含めない）

---

## 3. 画像配置パターン（2種類）

別プロジェクトでは **パターン A（MVP・推奨）** から始めることを推奨します。  
niko-baby 初期版（commit `3db9afc` 頃）と同じ考え方です。

### パターン A：カテゴリ共有プール（MVP・推奨）

カテゴリごとに画像スロットを用意し、複数商品が **同じファイルを参照**してよい。

```
public/images/products/{categorySlug}/01.jpg
public/images/products/{categorySlug}/02.jpg
...
public/images/products/{categorySlug}/{NN}.jpg
```

| 項目 | 値 |
|------|-----|
| 形式 | JPG（PNG 不可。Next.js Image は JPG 想定） |
| 比率 | **1:1** |
| 推奨サイズ | **1000×1000 px** |
| 命名 | `01.jpg`〜`NN.jpg`（**2桁ゼロ埋め**） |
| 最大枚数 | カテゴリあたり 3〜4 枚（MVP） |

**商品 ID 規約**

```
{categorySlug}-{連番2桁}
例: babywear-01, babywear-02, innerwear-01
```

**products.ts の書き方（例）**

```typescript
function img(category: string, file: string) {
  return `/images/products/${category}/${file}.jpg`;
}

// babywear-01: 01 がサムネ、02 が詳細2枚目
{
  id: "babywear-01",
  name: "オーガニックコットン カバーオール",
  price: 2990,
  categorySlug: "babywear",
  images: [img("babywear", "01"), img("babywear", "02")],
  stages: ["nenne", "kubisuwari"],
  gender: "unisex",
  sizes: ["50", "60", "70"],
  colors: ["アイボリー"],
  rating: 4.7,
  reviewCount: 128,
  description: "...",
  material: "綿100%",
  care: "ネット使用",
  reviews: [],
}
```

**メリット**

- カテゴリ指定だけで「必要ファイル一覧」が確定する
- 画像生成 AI に「babywear 用 4 枚」と渡しやすい
- Python・スクレイパー不要

**注意**

- 同一カテゴリ内で `01.jpg` を複数商品が共有してよい（初期 niko-baby と同じ）
- 商品ごとに別画像が必要なら **パターン B** を使う

---

### パターン B：商品 ID 単位（本番・niko-baby 現行）

商品ごとに独立フォルダ。スクレイプ後の niko-baby がこの方式。

```
public/images/products/{productId}/01.jpg
public/images/products/{productId}/02.jpg
...
public/images/products/{productId}/08.jpg   ← 最大8枚
```

| 項目 | 値 |
|------|-----|
| フォルダ名 | 商品 `id` と **完全一致**（例: `51272`, `babywear-01` も可） |
| 枚数 | 1〜8 枚（`01` がサムネ） |
| Web パス例 | `/images/products/51272/01.jpg` |

**products.ts の書き方（例）**

```typescript
{
  id: "51272",
  categorySlug: "babywear",
  images: [
    "/images/products/51272/01.jpg",
    "/images/products/51272/02.jpg",
    "/images/products/51272/03.jpg",
  ],
  // ...
}
```

---

## 4. カテゴリ指定時の納品物（Deliverables）

### 4.1 入力

```json
{
  "categorySlug": "babywear"
}
```

### 4.2 出力（パターン A の場合）

#### ① 画像ファイル

```
public/images/products/babywear/
  01.jpg   ← 1000×1000, 1:1
  02.jpg
  03.jpg
  04.jpg
```

#### ② カテゴリ manifest（JSON）

別プロジェクト → サイト側への受け渡し用。**必須**。

```json
{
  "categorySlug": "babywear",
  "pattern": "category-pool",
  "imageSlots": [
    { "file": "01.jpg", "role": "thumbnail-or-detail", "width": 1000, "height": 1000 },
    { "file": "02.jpg", "role": "detail", "width": 1000, "height": 1000 },
    { "file": "03.jpg", "role": "detail", "width": 1000, "height": 1000 },
    { "file": "04.jpg", "role": "detail", "width": 1000, "height": 1000 }
  ],
  "products": [
    {
      "id": "babywear-01",
      "name": "オーガニックコットン カバーオール",
      "price": 2990,
      "images": ["01.jpg", "02.jpg"],
      "gender": "unisex",
      "sizes": ["50", "60", "70"],
      "stages": ["nenne", "kubisuwari"]
    },
    {
      "id": "babywear-02",
      "name": "ふんわりガーゼ ツーウェイオール",
      "price": 2490,
      "images": ["02.jpg", "01.jpg"],
      "gender": "unisex",
      "sizes": ["50", "60"],
      "stages": ["nenne"]
    }
  ]
}
```

#### ③ manifest → products.ts 変換ルール

| manifest フィールド | products.ts フィールド | 変換 |
|--------------------|----------------------|------|
| `id` | `id` | そのまま |
| `categorySlug` | `categorySlug` | そのまま |
| `images: ["01.jpg"]` | `images: ["/images/products/babywear/01.jpg"]` | プレフィックス付与 |
| `price` | `price` | そのまま（整数・税込円） |
| 未指定 | `rating` | `4.5` など固定値で可 |
| 未指定 | `reviewCount` | `0` または適当な整数 |
| 未指定 | `description`, `material`, `care` | プレースホルダー文言で可 |
| 未指定 | `reviews` | `[]` |

**Web パス生成式（パターン A）**

```
/images/products/{categorySlug}/{images[i]}
```

**Web パス生成式（パターン B）**

```
/images/products/{productId}/{NN}.jpg
```

---

## 5. カテゴリ別 必要画像チェックリスト（MVP）

パターン A で **全カテゴリを埋める**場合の最小セット。

| categorySlug | 商品数 | 画像スロット | 納品ディレクトリ |
|--------------|--------|-------------|----------------|
| babywear | 4 | 01〜04 | `public/images/products/babywear/` |
| innerwear | 3 | 01〜03 | `public/images/products/innerwear/` |
| shoes-accessories | 3 | 01〜03 | `public/images/products/shoes-accessories/` |
| carry | 3 | 01〜03 | `public/images/products/carry/` |
| furniture | 3 | 01〜03 | `public/images/products/furniture/` |
| feeding | 3 | 01〜03 | `public/images/products/feeding/` |
| care | 3 | 01〜03 | `public/images/products/care/` |
| toys-memorial | 3 | 01〜03 | `public/images/products/toys-memorial/` |

**合計**: 25 商品 / 28 画像ファイル（カテゴリプール合計）

---

## 6. 共通画像（サイト全体・任意）

商品以外で TOP 等に使う画像。カテゴリ納品とは別枠。

| 用途 | パス | サイズ | 比率 |
|------|------|--------|------|
| ロゴ | `public/images/logo.png` | 240×60 | — |
| favicon | `public/images/icon.png` | 64×64 | 1:1 |
| ヒーロー | `public/images/common/hero_01.jpg` | 1600×900 | 16:9 |
| 月齢ステージ | `public/images/common/stage_{slug}V1.jpg` | 900×675 | 4:3 |

`stage_{slug}` の slug: `nenne`, `kubisuwari`, `haihai`, `anyo`

参考: niko-baby の `scripts/generate-placeholders.mjs`（Node + sharp）が同パスにプレースホルダーを一括生成できる。

---

## 7. 検収手順（QA）

カテゴリ `{slug}` を納品したあと、サイト側で以下を確認。

### 7.1 ファイル存在チェック

```bash
# 例: babywear
ls public/images/products/babywear/01.jpg
# products.ts 内の babywear 商品について
# images[] の各パスに対応するファイルが public/ 以下に存在するか
```

### 7.2 ブラウザ確認

1. `http://localhost:3000/category/{slug}` — 全カードに画像
2. 各商品の `/products/{id}` — メイン＋サムネ切替
3. DevTools Network — 画像リクエストが **200**（404 なし）

### 7.3 自動チェック（任意・Node のみ）

```javascript
// check-images.mjs — Python 不要
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const productsTs = readFileSync("lib/data/products.ts", "utf8");
const paths = [...productsTs.matchAll(/"(\/images\/products\/[^"]+)"/g)].map((m) => m[1]);
const missing = paths.filter((p) => !existsSync(join("public", p));
if (missing.length) {
  console.error("Missing:", missing);
  process.exit(1);
}
console.log(`OK: ${paths.length} images`);
```

---

## 8. 作業フロー（別プロジェクト → サイト）

```
┌─────────────────────┐
│ 1. categorySlug 指定 │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. manifest.json 作成│  ← 商品名・価格・images 割当
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. 画像生成           │  ← AI / 手作業 / 任意ツール
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. public/ に配置    │  ← パス・ファイル名厳守
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. products.ts 更新  │  ← manifest から手書き or 簡易変換
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. npm run build     │  ← エラーなし
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. 検収（§7）        │
└─────────────────────┘
```

---

## 9. サンプル：babywear 完全例（パターン A）

### 9.1 ディレクトリ

```
public/images/products/babywear/
  01.jpg
  02.jpg
  03.jpg
  04.jpg
```

### 9.2 manifest（`data/handoff/babywear.json`）

```json
{
  "categorySlug": "babywear",
  "pattern": "category-pool",
  "products": [
    {
      "id": "babywear-01",
      "name": "オーガニックコットン カバーオール",
      "price": 2990,
      "images": ["01.jpg", "02.jpg"],
      "gender": "unisex",
      "sizes": ["50", "60", "70"],
      "stages": ["nenne", "kubisuwari"],
      "colors": ["アイボリー"]
    },
    {
      "id": "babywear-02",
      "name": "ふんわりガーゼ ツーウェイオール",
      "price": 2490,
      "images": ["02.jpg", "03.jpg"],
      "gender": "unisex",
      "sizes": ["50", "60"],
      "stages": ["nenne"],
      "colors": ["クリーム"]
    },
    {
      "id": "babywear-03",
      "name": "リブ編みロンパース",
      "price": 2190,
      "images": ["03.jpg", "04.jpg"],
      "gender": "girl",
      "sizes": ["60", "70"],
      "stages": ["kubisuwari"],
      "colors": ["ピンク"]
    },
    {
      "id": "babywear-04",
      "name": "チェック柄半袖ロンパース",
      "price": 1990,
      "images": ["01.jpg", "04.jpg"],
      "gender": "boy",
      "sizes": ["70", "80"],
      "stages": ["haihai"],
      "colors": ["ブルー"]
    }
  ]
}
```

### 9.3 products.ts 断片（変換後）

```typescript
function img(cat: string, n: string) {
  return `/images/products/${cat}/${n}.jpg`;
}

// products 配列に追加
{
  id: "babywear-01",
  name: "オーガニックコットン カバーオール",
  price: 2990,
  categorySlug: "babywear",
  images: [img("babywear", "01"), img("babywear", "02")],
  stages: ["nenne", "kubisuwari"],
  gender: "unisex",
  sizes: ["50", "60", "70"],
  colors: ["アイボリー"],
  rating: 4.7,
  reviewCount: 128,
  description: "肌あたりのよいオーガニックコットンカバーオール。",
  material: "綿100%（オーガニックコットン）",
  care: "ネット使用・洗濯表示に従ってください。",
  reviews: [],
},
// babywear-02 〜 04 も同様
```

---

## 10. niko-baby 参照ファイル

| 用途 | パス |
|------|------|
| 型定義 | `lib/data/types.ts` |
| カテゴリ | `lib/data/categories.ts` |
| 商品（現行・自動生成） | `lib/data/products.ts` |
| カテゴリページ | `app/category/[slug]/page.tsx` |
| 商品詳細 | `app/products/[id]/page.tsx` |
| 一覧カード | `components/ProductCard.tsx` |
| 詳細ギャラリー | `components/ProductGallery.tsx` |
| プレースホルダー生成 | `scripts/generate-placeholders.mjs` |
| 設計書（画像リスト） | `docs/DESIGN.txt` |

---

## 11. よくある失敗

| 症状 | 原因 | 対処 |
|------|------|------|
| カテゴリページだけ画像が壊れる | `images[0]` のパス typo | manifest と実ファイルを突合 |
| 詳細だけ壊れる | `images[1..]` 未配置 | 詳細用スロットを追加生成 |
| 全商品同じ画像 | パターン A で正常。別画像にしたいならパターン B | 商品 ID フォルダに変更 |
| デプロイ後だけ 404 | 画像が Git に含まれていない | `public/images/products/` をコミット |
| カテゴリがナビに出ない | その slug の商品が 0 件 | `getActiveCategories()` は商品数 > 0 のみ表示 |

---

## 12. バージョン

| 項目 | 値 |
|------|-----|
| 基準リポジトリ | niko-baby |
| 想定サイト状態 | 初期 MVP（UI 完成・商品データ手書き） |
| 更新日 | 2026-09-06 |
