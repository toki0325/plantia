# サイト修正指示書（Cloud Agent 用）

PLANTIA（novagrace-ec）向け。**このファイルを読んで、下記タスクをすべて実装する。**  
質問せず、記載どおりに進める。完了後はブラウザまたは `curl` で検収チェックを通す。

Next.js 16 の API は `node_modules/next/dist/docs/` を読んでからコードを書く。

---

## 0. 目的と完成の定義

初期実装の「生成画像つきダミー商品」をやめ、handoff で追加した実商品だけを表に出す。  
トップ・特集・フッター・商品詳細を、開設前の状態として整える。

| # | 完成条件 |
|---|---------|
| 1 | トップ「カテゴリから探す」直下に「ガーデニング用品特集をすべて見る」が無い |
| 2 | 「人気のおすすめ商品」が **handoff 商品だけ** から 6件程度ピックアップされている |
| 3 | `buildBatch` / 初期ダミー商品がカタログから消えている。トップヒーロー・特集サムネ・カテゴリ画像は残っている |
| 4 | トップ「関連特集」が **6件**。中身は新商品カテゴリに紐づく。特集詳細に関連商品グリッドがある |
| 5 | 商品詳細にレビュー見出し・レビュー本文が無い |
| 6 | フッター「PLANTIA」下が、現行のトップカテゴリ（`browseCategories`）になっている |

---

## 1. 「ガーデニング用品特集をすべて見る」を消す

**対象:** `app/page.tsx`

- `<MainCategoryCards />` の下にある `<p>…ガーデニング用品特集をすべて見る</p>` ブロックを削除する。
- 削除後、`GARDEN_DIY_PATH` をこのファイルで使っていなければ import からも外す。
- 「カテゴリから探す」グリッド自体は残す。

---

## 2. 人気のおすすめ商品を新商品から出す

**対象:** `lib/data/products.ts` の `getPopularProducts()`

現状は初期ダミー ID 固定:

```ts
"weed-sand-01", "flower-bed-01", "joint-tile-01",
"artificial-grass-01", "storage-bench-01", "storage-bench-02"
```

これらは §3 で消えるので、**handoff 由来の商品 ID** に差し替える。

**ルール**

- 件数は **6件**
- すべて `fromCategoryHandoff(...)` で入る商品（`data/handoff/*.json`）
- 同じカテゴリに偏らせない。例:

| 商品 ID（例） | カテゴリ |
|--------------|---------|
| `outdoor-storage-01` | 屋外収納庫・物置 |
| `garden-furniture-01` | ガーデンファニチャー |
| `shade-parasol-01` | 日除けシェード |
| `joint-tile-01` ※handoff 側の ID | ジョイントタイル |
| `garden-light-01` ※handoff 側の ID | ガーデンライト |
| `planter-01` ※handoff 側の ID | プランター |

- 実装前に各 JSON の先頭商品 `id` を確認してから書く。存在しない ID は入れない。
- `app/mypage/favorite/page.tsx` も `getPopularProducts()` を使っている。ダミー削除後も空にならないこと。

---

## 3. 初期の生成画像商品を全削除（サイト画像は残す）

### 3.1 残すもの（削除禁止）

次は **ファイルも参照も消さない**。

| 種類 | パス |
|------|------|
| トップヒーロー | `public/images/hero/hero_main_v1.jpg` |
| カテゴリ画像（親） | `public/images/categories/*.jpg` |
| 特集サムネ | `public/images/features/feature_01_v1.jpg` 〜 `feature_10_v1.jpg` |
| ロゴ・アイコン | `public/images/logo.png`, `public/images/icon_v1.png` |
| 共通 | `public/images/common/**` |
| **新規 handoff 商品画像** | `public/images/products/{下記16 slug}/**` |

handoff 16 slug（商品画像を残す）:

```
outdoor-storage, garden-furniture, shade-parasol, garden-ornament,
grass-tile-stone, planter, flower-stand, fence, ac-cover,
outdoor-trash, greenhouse, garden-arch, joint-tile, garden-light,
soil, hose-reel
```

`lib/data/home.ts` の `heroImages` はカテゴリ画像とヒーローを指している。  
`heroImages.d` が `/images/products/garden-light/garden-light-01_v1.jpg`（旧生成パス）なら、**ファイルを消す前に** 既存のカテゴリ画像か handoff 側の実画像パスへ付け替える。トップが 404 にならないこと。

### 3.2 カタログから消す商品

**対象:** `lib/data/products.ts` の `rawProducts`

削除対象（初期ダミー）:

- 個別定義: `weed-sand-01`, `flower-bed-01`, `artificial-grass-01`, `storage-bench-01`, `storage-bench-02`
- `buildBatch(...)` の呼び出し **全部**
  - `artificial-grass`, `stones`, `storage-bench`, `flower-bed`, `gardening-misc`, `herbicide`, `weed-sheet`, `weed-sand`

残すもの:

- `...fromCategoryHandoff(...)` の 16 行だけ

`buildBatch` と `GARDENING_TAGS` がどこからも使われなくなったら関数ごと削除する。

`toDetail` 内の `raw.folder === "artificial-grass" | "storage-bench" | "joint-tile"` による sizes/colors 分岐は、該当ダミーが消えるので整理してよい。handoff の `colors` はそのまま使う。

### 3.3 旧カテゴリ定義の整理

ダミー商品だけのサブカテゴリは、空ページを残さない。

**商品が無くなる slug（handoff に無い）:**

```
artificial-grass, stones, storage-bench, flower-bed,
gardening-misc, herbicide, weed-sheet, weed-sand
```

対応:

1. `lib/data/categories.ts` の上記 `subCategories` を削除する。
2. 親 `weeding`（雑草対策）は子も商品も無くなる。`parentCategories` から `weeding` を削除する。
3. `lib/data/home.ts` の `mainCategories` / `homeSections` から、上記 slug と `weeding` ブロックを外す。
4. `/contents/garden-diy` は `homeSections` 依存。空セクションや 404 画像参照が残らないようにする（セクションを新カテゴリに差し替えるか、旧サブだけ削る）。
5. ヘッダーモバイルメニュー（`components/layout/SiteHeader.tsx`）は `mainCategories` を表示している。`weeding` 削除後もリンク切れしないこと。

親カテゴリ `grass-tile-stone` / `furniture` / `gardening` は、handoff 商品がぶら下がるので **残す**。

### 3.4 旧商品画像ファイル

`public/images/products/` のうち、§3.1 の 16 slug 以外のフォルダ  
（例: `artificial-grass`, `stones`, `storage-bench`, `flower-bed`, `gardening-misc`, `herbicide`, `weed-sheet`, `weed-sand`）は、  
**どこからも参照されていないことを確認してから** 削除してよい。

次は消さない:

- `public/images/hero/`
- `public/images/features/`
- `public/images/categories/`
- `public/images/common/`
- ロゴ・favicon
- handoff 16 カテゴリの商品画像

---

## 4. 関連特集を 6件にし、特集詳細に関連商品を出す

### 4.1 トップの件数

**対象:** `lib/data/features.ts` の `getRelatedFeaturesForHome()`

現状: `features.slice(0, 5)` → **6件** にする。

出す 6件は **新商品カテゴリに関連するもの**。初期ダミー（人工芝ガイド・除草・防草砂・収納ベンチ）をトップに並べない。

**トップに出す 6件（推奨）**

| slug（既存を優先） | 紐づける商品カテゴリ |
|-------------------|---------------------|
| `garden-furniture` | `garden-furniture` |
| `garden-light` | `garden-light` |
| `hose-reel` | `hose-reel` |
| `joint-tile` | `joint-tile` |
| 新規 `outdoor-storage` を追加 | `outdoor-storage` |
| 新規 `planter` または既存を改題して `planter` に紐づけ | `planter` |

- 特集サムネは **既存の** `/images/features/feature_XX_v1.jpg` を使い回す（新規画像生成不要。`feature_01`〜`10` を消さない）。
- `/feature` 一覧に古い特集が残ってもよい。トップの 6件だけ新カテゴリ寄せにする。
- タイトル・本文はガーデニング向けの既存トーンで短く書いてよい。他社サイトの文言はコピーしない。

### 4.2 特集 ↔ 商品の紐づけ

`FeatureArticle` に関連カテゴリを足す。

```ts
relatedCategorySlug?: string;
```

各特集に、上表の slug を入れる。

`lib/data/products.ts` にヘルパーを追加:

```ts
getProductsByCategorySlug(slug).slice(0, 8).map(toSummary)
```

既存の `getProductsByCategorySlug` を使えばよい。

### 4.3 特集詳細に商品を出す

**対象:** `app/feature/[slug]/page.tsx`

記事本文の下（`PageSection` を分けても可）に「この特集の商品」を出す。

- `feature.relatedCategorySlug` があるときだけ表示
- `ShopProductGrid`（`components/product/ShopProductCard.tsx`）を使う
- 0件ならセクション自体出さない
- 見出し例: 「この特集の商品」

`/feature` 一覧ページのレイアウトは変えなくてよい。

---

## 5. 商品詳細からレビューを外す

開設前のため、ダミーレビューは出さない。

**対象**

- `app/products/[id]/page.tsx` — `<ProductReviews />` と import を削除
- `components/product/ProductDetailView.tsx` — `ProductReviews` コンポーネントを削除
- `lib/data/products.ts` の `toDetail` — `reviews: []` にする（型が `reviews: ProductReview[]` 必須なら空配列）

`getRanking()` は `reviews.length` でソートしている。全部 0 になるので、`createdAt` または `price` など別キーに変える。

関連商品ブロックは残す。

---

## 6. フッター「PLANTIA」下のリンクを変える

**対象:** `components/layout/SiteFooter.tsx`

現状（旧4親カテゴリ）:

```
人工芝・タイル・砂利
ガーデンファニチャー
園芸用品
雑草対策
```

これを **トップ「カテゴリから探す」と同じ一覧** にする。

**実装**

- 見出しは「PLANTIA」のまま、または直下に小さく「カテゴリ」を足してもよい
- リンクは `browseCategories`（`lib/data/home.ts`）を import して使う。配列を二重管理しない
- 16件あるので、スマホは1列、`md` 以上は **2列** のコンパクトなリスト（`text-xs` または `text-sm`、行間つめめ）
- フッター全体は今の3カラム（PLANTIA / ショップ情報 / サポート）を崩さない。PLANTIA列だけ幅を広げるなら `md:grid-cols-4` や PLANTIA列を `md:col-span-1` のまま2列リスト、で収める
- `雑草対策` など削除済みカテゴリへのリンクを残さない

---

## 7. やってはいけないこと

- ディノス等の外部サイトから画像・文言を取得しない
- `public/images/hero/`, `features/`, `categories/`, ロゴ、`common/` を削除しない
- handoff 16カテゴリの商品画像・`data/handoff/*.json` を消さない
- トップのカテゴリグリッド自体を元の4枚カードに戻さない
- コミット・push は指示が無い限りしない

---

## 8. 検収

```text
GET /                          200
  「ガーデニング用品特集をすべて見る」が HTML に無い
  「人気のおすすめ商品」のカード href が handoff 商品 ID
  「関連特集」のカードが 6件
GET /category/outdoor-storage  200・商品あり
GET /category/weeding          404 またはカテゴリ削除済み
GET /category/herbicide        404
GET /products/{handoffの1件}   200・「レビュー」見出しが無い
GET /feature/garden-furniture  200・下部に商品カード
GET /feature/outdoor-storage   200（新規した場合）・商品カードあり
```

フッターに `browseCategories` の名称（例: 屋外収納庫・物置、ホース・ホースリール）があり、`雑草対策` が無いこと。

変更した画面は、可能ならブラウザでトップ → 特集詳細 → 商品詳細 → フッターを一通り踏む。

---

## 9. 作業順（推奨）

1. ダミー商品削除（`products.ts`）と人気商品 ID 差し替え  
2. 空になるカテゴリ定義・`homeSections`・ヘッダーの掃除  
3. 旧商品画像フォルダ削除（参照ゼロを確認してから）  
4. 特集 6件 + `relatedCategorySlug` + 特集詳細の商品グリッド  
5. レビュー削除  
6. トップの特集リンク削除  
7. フッター差し替え  
8. 検収
