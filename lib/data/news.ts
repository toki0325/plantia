export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  publishedAt: string;
};

export const newsItems: NewsItem[] = [
  {
    id: "2026-08-01",
    title: "夏季配送のご案内",
    summary: "夏季期間中の配送スケジュールについてお知らせします。",
    publishedAt: "2026-08-01",
    body: [
      "平素よりNOVAGRACEをご利用いただき、誠にありがとうございます。",
      "8月10日〜8月15日の期間中、配送が通常より1〜2日遅れる場合がございます。",
      "ご不便をおかけいたしますが、何卒ご了承ください。",
    ],
  },
  {
    id: "2026-07-15",
    title: "新商品「防草人工砂」取り扱い開始",
    summary: "撒くだけで施工できる防草人工砂を新たにラインナップ。",
    publishedAt: "2026-07-15",
    body: [
      "NOVAGRACEにて、防草人工砂の取り扱いを開始しました。",
      "エコで人に優しい素材を使用し、お庭のメンテナンスをサポートします。",
    ],
  },
  {
    id: "2026-06-20",
    title: "サイトリニューアルのお知らせ",
    summary: "より見やすく、探しやすいサイトへリニューアルしました。",
    publishedAt: "2026-06-20",
    body: [
      "NOVAGRACEオンラインショップをリニューアルいたしました。",
      "カテゴリ構成や特集ページを刷新し、お庭づくりの参考情報を充実させています。",
    ],
  },
];

export function getNewsById(id: string): NewsItem | undefined {
  return newsItems.find((n) => n.id === id);
}
