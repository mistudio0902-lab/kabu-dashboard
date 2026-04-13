-- ============================================================
-- kabu-dashboard: Supabase 移行SQL（mi-studio org用）
-- 新プロジェクトのSQL Editorで実行してください
-- ============================================================

-- 1. ポートフォリオ日次サマリー
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_daily (
  date              DATE PRIMARY KEY,
  total_capital     NUMERIC      NOT NULL,
  daily_pnl         NUMERIC      NOT NULL,
  daily_pnl_pct     NUMERIC      NOT NULL,
  n_trades          INT          NOT NULL DEFAULT 0,
  n_long            INT          NOT NULL DEFAULT 0,
  n_short           INT          NOT NULL DEFAULT 0,
  drawdown          NUMERIC      NOT NULL DEFAULT 0,
  cash_ratio        NUMERIC,
  holdings_count    INT,
  unrealized_pnl    NUMERIC,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. トレード履歴（2日遅延で公開）
-- ============================================================
CREATE TABLE IF NOT EXISTS trades (
  id              BIGSERIAL    PRIMARY KEY,
  timestamp       TIMESTAMPTZ  NOT NULL,
  date            DATE         NOT NULL,
  ticker          TEXT         NOT NULL,
  side            TEXT         NOT NULL,   -- "BUY" | "SELL"
  quantity        INT          NOT NULL,
  price           NUMERIC      NOT NULL,
  notional        NUMERIC      NOT NULL,
  signal_score    NUMERIC,
  kelly_weight    NUMERIC,
  order_result    TEXT,                    -- "success" | "error" | "skipped"
  strategy        TEXT,
  strategy_name   TEXT,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trades_date_idx ON trades (date DESC);

-- 3. ポジション（保有銘柄・未実現損益）
-- ============================================================
CREATE TABLE IF NOT EXISTS positions (
  id              BIGSERIAL    PRIMARY KEY,
  date            DATE         NOT NULL,
  ticker          TEXT         NOT NULL,
  quantity        INT          NOT NULL,
  entry_price     NUMERIC      NOT NULL,
  current_price   NUMERIC,
  unrealized_pnl  NUMERIC,
  side            TEXT         NOT NULL DEFAULT 'LONG',   -- "LONG" | "SHORT"
  strategy        TEXT,
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 4. Row Level Security
-- ============================================================
ALTER TABLE portfolio_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions       ENABLE ROW LEVEL SECURITY;

-- portfolio_daily: 全行公開
CREATE POLICY "public_read_portfolio"
  ON portfolio_daily FOR SELECT TO anon
  USING (total_capital > 0);

-- trades: 2日遅延で公開
CREATE POLICY "public_read_trades_delayed"
  ON trades FOR SELECT TO anon
  USING (date <= CURRENT_DATE - INTERVAL '2 days');

-- positions: 公開なし（anon不可）
-- service_role からのみ読み書き可能

-- 5. 累積リターン計算ビュー
-- ============================================================
CREATE OR REPLACE VIEW portfolio_cumulative AS
SELECT
  date,
  total_capital,
  daily_pnl,
  daily_pnl_pct,
  n_trades,
  drawdown,
  (total_capital - FIRST_VALUE(total_capital) OVER (ORDER BY date))
    / NULLIF(FIRST_VALUE(total_capital) OVER (ORDER BY date), 0) AS cumulative_return
FROM portfolio_daily
WHERE total_capital > 0
ORDER BY date;
