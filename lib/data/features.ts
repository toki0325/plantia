export type FeatureArticle = {
  slug: string;
  title: string;
  description: string;
  image: string;
  body: string[];
  publishedAt: string;
  relatedCategorySlug?: string;
};

export const features: FeatureArticle[] = [
  {
    slug: "artificial-grass-guide",
    title: "おすすめの人工芝特集｜DIY・施工ガイド",
    description:
      "リアル人工芝で、お庭を手軽におしゃれな空間へ！施工方法からメンテナンスまで。",
    image: "/images/features/feature_01_v1.jpg",
    publishedAt: "2026-06-01",
    body: [
      "人工芝は、メンテナンスの手間を抑えながら、一年中グリーンな空間を保てるのが魅力です。",
      "施工の基本は、地面の整地、防草シートの敷設、人工芝のカットと固定です。",
      "PLANTIAでは、ベランダからお庭まで、空間に合わせたセレクトをご提案しています。",
    ],
  },
  {
    slug: "joint-tile",
    title: "ジョイントタイルで庭・ベランダを手軽におしゃれ空間に",
    description: "敷くだけ・置くだけで、理想のDIYが簡単に実現できます。",
    image: "/images/features/feature_joint-tile_v2.jpg",
    publishedAt: "2026-05-15",
    relatedCategorySlug: "joint-tile",
    body: [
      "ジョイントタイルは、工具不要で手軽に施工できるのが特徴です。",
      "樹脂・アカシア・人工芝など、素材とカラーの組み合わせで自分好みの空間に。",
    ],
  },
  {
    slug: "storage-bench",
    title: "静かに開閉できる収納ベンチ・縁台特集",
    description: "屋外収納とくつろぎの空間を両立する収納ベンチ。",
    image: "/images/features/feature_03_v1.jpg",
    publishedAt: "2026-04-20",
    body: [
      "収納ベンチは、ガーデニング道具の収納と、縁台としての機能を兼ね備えます。",
      "静かに開閉できる機構で、近所への配慮も万全です。",
    ],
  },
  {
    slug: "weeding-guide",
    title: "雑草対策～お庭・芝生・駐車場・畑～場所別ガイド",
    description: "除草剤、防草シート、防草砂など、場所別のおすすめアイテム。",
    image: "/images/features/feature_04_v1.jpg",
    publishedAt: "2026-03-10",
    body: [
      "雑草対策は、場所と用途によって最適な方法が異なります。",
      "防草シート、除草剤、防草砂を組み合わせて、長期的なメンテナンスを軽減しましょう。",
    ],
  },
  {
    slug: "garden-light",
    title: "ガーデンライトで夜のお庭も楽しもう",
    description: "ソーラーライトやLEDライトで、ナイトガーデンを演出。",
    image: "/images/features/feature_garden-light_v2.jpg",
    publishedAt: "2026-02-28",
    relatedCategorySlug: "garden-light",
    body: [
      "ガーデンライトは、夜の安全性確保と、空間の演出を同時に叶えます。",
      "電気代を抑えたい方には、ソーラータイプがおすすめです。",
    ],
  },
  {
    slug: "herbicide",
    title: "おすすめ除草グッズ特集",
    description: "除草作業をラクにする、液体・粒状の除草剤ラインナップ。",
    image: "/images/features/feature_06_v1.jpg",
    publishedAt: "2026-01-15",
    body: [
      "除草剤は、使用場所と雑草の種類に合わせて選ぶことが大切です。",
      "そのまま使えるタイプや、エコなお酢ベースなど、用途に合わせてお選びください。",
    ],
  },
  {
    slug: "weed-sheet-guide",
    title: "防草シートとは？敷き方やメリット・デメリットを解説",
    description: "敷くだけで雑草の成長を抑える防草シートの基礎知識。",
    image: "/images/features/feature_07_v1.jpg",
    publishedAt: "2025-12-01",
    body: [
      "防草シートは、地面に敷くことで雑草の発芽を抑えるシートです。",
      "高密度タイプほど耐久性が高く、長期間のメンテナンスフリーが期待できます。",
    ],
  },
  {
    slug: "weed-sand",
    title: "撒くだけで防草できる人工砂",
    description: "エコで人に優しい、新時代の防草アイテム。",
    image: "/images/features/feature_08_v1.jpg",
    publishedAt: "2025-11-20",
    body: [
      "防草人工砂は、撒くだけで施工できる手軽さが魅力です。",
      "水で固まるタイプと組み合わせて、デザイン性の高い空間づくりも可能です。",
    ],
  },
  {
    slug: "garden-furniture",
    title: "お庭でくつろぐガーデンファニチャー",
    description: "カフェのような空間を、私のお庭に。",
    image: "/images/features/feature_garden-furniture_v2.jpg",
    publishedAt: "2025-10-05",
    relatedCategorySlug: "garden-furniture",
    body: [
      "ガーデンファニチャーは、くつろぎの時間を演出する主役です。",
      "ラタン調や木目調など、お庭のテイストに合わせてセレクトしましょう。",
    ],
  },
  {
    slug: "hose-reel",
    title: "ホース・ホースリールで毎日の散水がラクになる",
    description: "使いやすさとデザイン性を両立したホースリール特集。",
    image: "/images/features/feature_10_v1.jpg",
    publishedAt: "2025-09-01",
    relatedCategorySlug: "hose-reel",
    body: [
      "散水作業のストレスを減らすには、ホースリール選びが重要です。",
      "ねじれにくいホース、コンパクトに収納できるリールなど、ライフスタイルに合わせて。",
    ],
  },
  {
    slug: "outdoor-storage",
    title: "屋外収納庫・物置でお庭をすっきり整理",
    description: "ガーデニング道具も余裕で収まる、屋外収納庫・物置特集。",
    image: "/images/features/feature_03_v1.jpg",
    publishedAt: "2026-06-20",
    relatedCategorySlug: "outdoor-storage",
    body: [
      "屋外収納庫は、散らかりがちなガーデニング用品をまとめて収納できます。",
      "薄型やベンチ兼用など、置き場所に合わせて選ぶのがおすすめです。",
    ],
  },
  {
    slug: "planter",
    title: "プランター・植木鉢で始めるベランダガーデン",
    description: "育てる楽しみが広がる、プランター・鉢カバー特集。",
    image: "/images/features/feature_07_v1.jpg",
    publishedAt: "2026-06-10",
    relatedCategorySlug: "planter",
    body: [
      "プランターは、限られたスペースでも植物を楽しめる園芸の基本アイテムです。",
      "菜園用の深型から、飾りやすい鉢カバーまで、用途に合わせてお選びください。",
    ],
  },
];

export function getFeatureBySlug(slug: string): FeatureArticle | undefined {
  return features.find((f) => f.slug === slug);
}

/** トップ「関連特集」に出す 6件。新商品カテゴリに紐づくものを優先。 */
const HOME_FEATURE_SLUGS = [
  "garden-furniture",
  "garden-light",
  "hose-reel",
  "joint-tile",
  "outdoor-storage",
  "planter",
];

export function getRelatedFeaturesForHome() {
  return HOME_FEATURE_SLUGS.map((slug) => features.find((f) => f.slug === slug))
    .filter((f): f is FeatureArticle => Boolean(f))
    .map((f) => ({
      id: f.slug,
      title: f.title,
      description: f.description,
      image: f.image,
      href: `/feature/${f.slug}`,
    }));
}
