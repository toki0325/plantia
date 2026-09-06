# Dinos 商品画像バッチ取得 — Cloud Agent 指示書

PLANTIA（novagrace-ec）向け。**Cursor Cloud Agent にこのファイルを読ませてタスクを実行**するための手順書です。

---

## 1. 目的

Dinos オンラインショップのガーデニング16カテゴリについて、各カテゴリ **最大20商品 × 最大6画像** を取得し、EC サイトに表示できる状態にする。

**完成の定義（1カテゴリあたり）**

- `public/images/products/{slug}/` に画像ファイルが存在する（404 なし）
- `data/handoff/{slug}.json` が Dinos 実データ（名称・価格・images[]）になっている
- `lib/data/products.ts` から当該カテゴリの商品が参照される
- `data/dinos/category-map.json` の `status` が `done` になっている

---

## 2. 読むべきファイル（作業前）

| ファイル | 内容 |
|---------|------|
| **本ファイル** | 作業手順 |
| `data/dinos/category-map.json` | 16カテゴリの Dinos URL・進捗 |
| `scripts/dinos_fetch.py` | 画像取得スクリプト |
| `data/handoff/outdoor-storage.json` | 完了見本 |
| `lib/data/products.ts` | 商品データ配線 |
| `lib/data/categories.ts` | slug と parentSlug |
| `docs/CATEGORY_IMAGE_HANDOFF.md` | 画像パス規約（詳細） |

---

## 3. リポジトリ構成

```
PLANTIA/
├── data/
│   ├── dinos/
│   │   └── category-map.json      ← 進捗管理（必読）
│   └── handoff/
│       ├── outdoor-storage.json   ← done（見本）
│       └── {slug}.json            ← カテゴリごとに生成
├── public/images/products/{slug}/
│   └── {slug}-01_01.jpg …         ← 商品ごと per-product 命名
├── scripts/
│   └── dinos_fetch.py
└── lib/data/products.ts
```

---

## 4. category-map.json の見方

```json
{
  "slug": "garden-furniture",
  "name": "ガーデンファニチャー",
  "dinosUrl": "https://www.dinos.co.jp/c4/002005015003/1a2/",
  "limit": 20,
  "maxImages": 6,
  "status": "pending"
}
```

| フィールド | 意味 |
|-----------|------|
| `slug` | PLANTIA のカテゴリ slug（paths・products.ts と一致） |
| `dinosUrl` | Dinos 一覧ページ URL（**手渡し不要**。ここを読む） |
| `limit` | 取得する商品数上限 |
| `maxImages` | 1商品あたりの画像枚数上限 |
| `status` | `pending` → 未処理 / `done` → 完了 / `failed` → 失敗（再実行対象） |

**1回の Agent タスクで処理する件数: pending 全件（最大16カテゴリ）を一気に走破する。**

- `outdoor-storage` は `done` のためスキップ
- 残り **15カテゴリ** を1タスクで完了させる
- 途中で失敗したカテゴリだけ `status` を `failed` にし、成功分は `done` — 未完了分のみ次回再実行

---

## 5. 作業手順

### Step 0 — 一括実行の準備（最初に1回）

1. `scripts/dinos_fetch.py` を `--slug` 対応に一般化する（Step A）
2. `scripts/dinos_fetch_all.py` で category-map の pending を順番に回せることを確認

```bash
cd PLANTIA
python scripts/dinos_fetch_all.py --dry-run   # 15件のコマンド列を確認
python scripts/dinos_fetch_all.py             # 全 pending を実行（目安 45〜90分）
```

**一括実行後**に `products.ts` へ16カテゴリ分の handoff をまとめて配線し、末尾で `npm run build` を1回だけ実行する。

---

## 5b. 作業手順（1カテゴリ）

### Step A — `dinos_fetch.py` が slug 非対応なら一般化する

現状は `outdoor-storage` 固定の可能性がある。以下を満たすよう修正する。

**必須 CLI 引数**

```bash
python scripts/dinos_fetch.py \
  --slug garden-furniture \
  --url https://www.dinos.co.jp/c4/002005015003/1a2/ \
  --limit 20 \
  --max-images 6
```

**出力先（slug から動的に決める）**

- 画像: `public/images/products/{slug}/`
- handoff: `data/handoff/{slug}.json`

**画像ファイル命名（per-product パターン）**

- `{slug}-01_01.jpg` … サムネ
- `{slug}-01_02.jpg` … 詳細2枚目
- 最大 `{slug}-20_06.jpg`

**handoff JSON 形式（outdoor-storage.json に合わせる）**

```json
{
  "categorySlug": "garden-furniture",
  "pattern": "per-product",
  "source": "https://www.dinos.co.jp/...",
  "products": [
    {
      "id": "garden-furniture-01",
      "name": "商品名（Dinos から）",
      "price": 39800,
      "images": [
        "garden-furniture-01_01.jpg",
        "garden-furniture-01_02.jpg"
      ]
    }
  ]
}
```

**技術メモ（既知の落とし穴）**

- Dinos HTML は **Shift_JIS**。`requests` で `r.encoding = r.apparent_encoding` を設定すること
- 価格は `offers.priceSpecification.price` に入っていることが多い
- 商品名の `【日本製】` 等のタグは `clean_name()` で除去してよい
- 詳細画像は HTML 内の `/enl/*.jpg` を優先。なければ `/etc/*c1.jpg`
- リクエスト間隔 `--interval 1.0` 以上を推奨

### Step B — スクリプト実行

```bash
cd PLANTIA
python scripts/dinos_fetch.py \
  --slug {slug} \
  --url {dinosUrl} \
  --limit {limit} \
  --max-images {maxImages}
```

商品数が `limit` 未満のカテゴリ（例: 温室2件）は **ある分だけ** 取得すればよい。

### Step C — `lib/data/products.ts` を配線

1. handoff JSON を import する

```typescript
import gardenFurnitureHandoff from "@/data/handoff/garden-furniture.json";
```

2. `rawProducts` に `fromCategoryHandoff` を追加

```typescript
...fromCategoryHandoff(gardenFurnitureHandoff, "furniture", true),
```

3. **同じ slug のプレースホルダー商品を削除する**

`buildBatch("garden-furniture", ...)` など、handoff と **slug が重複する既存エントリは除去**すること。重複すると同一カテゴリに仮商品と Dinos 商品が混在する。

| slug | 削除対象の例 | parentCategorySlug |
|------|-------------|-------------------|
| outdoor-storage | （済） | `furniture` |
| garden-furniture | `buildBatch("garden-furniture", ...)` | `furniture` |
| shade-parasol | なし（新規） | `furniture` |
| garden-ornament | なし（新規） | `furniture` |
| grass-tile-stone | なし（親カテゴリ slug。browse タイルと一致） | `grass-tile-stone` |
| planter | `buildBatch("planter", ...)` | `gardening` |
| flower-stand | なし（新規） | `gardening` |
| fence | `buildBatch("fence", ...)` | `furniture` |
| ac-cover | なし（新規） | `furniture` |
| outdoor-trash | なし（新規） | `furniture` |
| greenhouse | なし（新規） | `gardening` |
| garden-arch | なし（新規） | `furniture` |
| joint-tile | `buildBatch("joint-tile", ...)` と `{ id: "joint-tile-01", ...}` | `grass-tile-stone` |
| garden-light | `buildBatch("garden-light", ...)` | `furniture` |
| soil | `buildBatch("soil", ...)` | `gardening` |
| hose-reel | なし（新規） | `gardening` |

`parentCategorySlug` は `lib/data/categories.ts` の `parentSlug` に合わせる。

### Step D — 動作確認

```bash
npm run build
```

ブラウザ確認（可能なら）:

- `/category/{slug}` — 商品カードのサムネが表示される
- `/products/{slug}-01` — ギャラリーで複数画像が切り替わる

### Step E — category-map を更新

該当エントリの `status` を `"done"` にし、必要なら `note` に取得件数を記録する。

---

## 6. Cloud Agent への投げ方

### 短いプロンプト（コピペ用）— 16カテゴリ一括

```
docs/DINOS_BATCH_FETCH.md と data/dinos/category-map.json を読んで、
pending の全カテゴリ（15件）を1タスクで完了させてください。

手順:
1. dinos_fetch.py を --slug 対応に一般化（未対応なら）
2. python scripts/dinos_fetch_all.py で全 pending の画像・handoff を取得
3. lib/data/products.ts に16カテゴリ分の fromCategoryHandoff を配線
   （重複する buildBatch プレースホルダーは削除）
4. category-map.json の成功分を done、失敗分を failed に更新
5. npm run build でビルド確認

完了後、全16カテゴリの処理結果表（商品数・画像枚数）を報告。
git commit は指示があるまで不要。Co-authored-by: Cursor は付けない。

途中でタイムアウトした場合は、完了した分まで報告し pending/failed を明示すること。
```

### 所要時間の目安（15カテゴリ一括）

| 項目 | 目安 |
|------|------|
| 画像取得 | 45〜90分 |
| products.ts 配線 + build | 10〜20分 |
| 合計画像数 | 〜1,800枚 |
| 合計データ量 | 〜100MB |

タイムアウトしても **成功したカテゴリは done のまま残す**。再実行時は `dinos_fetch_all.py` が pending/failed のみ処理する。

---

## 7. やってはいけないこと

- **ユーザーが指示していない git commit / push**
- **`git config` の変更**
- **`Co-authored-by: Cursor`** をコミットメッセージに含める（Netlify デプロイ問題の原因になる）
- category-map を読まずに URL を推測する（Dinos の数字 ID は推測不可）
- handoff 追加後も `buildBatch` の仮商品を残す

---

## 8. 16カテゴリ一覧（参照）

| status | slug | name | Dinos URL |
|--------|------|------|-----------|
| done | outdoor-storage | 屋外収納庫・物置 | c3/002005014 |
| pending | garden-furniture | ガーデンファニチャー | c4/002005015003 ※セット |
| pending | shade-parasol | 日除けシェード・ガーデンパラソル | c3/002005016 |
| pending | garden-ornament | ガーデンオーナメント・置物 | c3/002005017 |
| pending | grass-tile-stone | 敷石・防草シート・芝 | c3/002005018 |
| pending | planter | プランター・植木鉢・鉢カバー | c3/002005019 |
| pending | flower-stand | フラワースタンド… | c3/002005020 |
| pending | fence | フェンス・ラティス・トレリス | c3/002005021 |
| pending | ac-cover | エアコン室外機カバー | c3/002005022 |
| pending | outdoor-trash | 屋外ゴミ箱/保管庫 | c3/002005023 |
| pending | greenhouse | 温室・ビニール温室 | c3/002005024 |
| pending | garden-arch | ガーデンアーチ・パーゴラ | c3/002005025 |
| pending | joint-tile | ウッドデッキ・ジョイントタイル | c3/002005026 |
| pending | garden-light | ガーデン/ソーラーライト | c3/002005027 |
| pending | soil | 園芸土/肥料 | c3/002005028 |
| pending | hose-reel | ホース・ホースリール | c3/002005029 |

最新の status は **`data/dinos/category-map.json` を正**とする。

---

## 9. 既知の注意点

### ガーデンファニチャーの URL

`garden-furniture` は Dinos 上 **「ガーデンファニチャーセット」**（c4/002005015003）。ユーザー指定。テーブル単体に変える場合は category-map の `dinosUrl` を変更する:

- テーブル: c4/002005015001
- チェア: c4/002005015002
- セット: c4/002005015003（現設定）

### 商品数が少ないカテゴリ

| カテゴリ | Dinos 掲載数 |
|---------|-------------|
| 温室 | 2件 |
| ホース | 10件 |
| 敷石・防草シート・芝 | 12件 |
| ガーデンアーチ | 12件 |
| ウッドデッキ | 16件 |

### joint-tile / grass-tile-stone の slug 関係

- browse タイル「ウッドデッキ…」→ slug `joint-tile`（既存 PLANTIA カテゴリ）
- browse タイル「敷石・防草シート・芝」→ slug `grass-tile-stone`（親カテゴリ slug を流用）
- handoff 追加時は **既存 buildBatch プレースホルダーとの競合**に注意

---

## 10. 完了報告テンプレート

Agent はタスク終了時に以下を報告すること:

```
## 処理結果

| slug | 商品数 | 画像枚数 | buildBatch削除 | status |
|------|--------|---------|---------------|--------|
| garden-furniture | 20 | 118 | yes | done |
| … | | | | |

## 残り pending / failed

（0件なら「全16カテゴリ完了」）

## 次の Agent への一言

（全完了なら不要。未完了があれば failed の slug を列挙）
```

---

## 11. 関連コマンド早見表

```bash
# pending 全カテゴリ一括取得（推奨）
python scripts/dinos_fetch_all.py

# 1カテゴリ取得
python scripts/dinos_fetch.py --slug {slug} --url {url} --limit 20 --max-images 6

# JSON のみ再生成（画像は再利用）
python scripts/dinos_fetch.py --slug {slug} --url {url} --skip-images

# ビルド確認
npm run build
```

---

*最終更新: 2026-03-06 — 16カテゴリ一括走破方針に更新*
