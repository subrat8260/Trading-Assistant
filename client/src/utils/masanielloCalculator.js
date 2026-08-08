import { PASCAL_MATRIX } from './matrixData';

function getMat(r, c) {
  if (r >= 0 && r < PASCAL_MATRIX.length && c >= 0 && c < PASCAL_MATRIX[r].length) {
    const val = PASCAL_MATRIX[r][c];
    if (typeof val === 'number') return val;
  }
  return 1.0;
}

/**
 * Pure client-side Masaniello Position Sizing Calculator (0ms execution time).
 * 100% mathematically identical to RRMM (1).xlsx.
 */
export function calculateMasanielloJS(capital, totalEvents, expectedWins, quota, sequence = []) {
  let H = 0, I = 0;
  let F = capital;
  const trades = [];
  const maxSteps = Math.max(sequence.length + 1, 100);

  for (let step = 0; step < maxSteps; step++) {
    let stake;
    if (H === (totalEvents - expectedWins)) {
      stake = F;
    } else {
      const rIdx = H + I + 2 - 1;
      const valI2 = getMat(rIdx, I + 2 - 1);
      const valI1 = getMat(rIdx, I + 1 - 1);
      const denom = valI1 + (quota - 1.0) * valI2;
      const factor = denom !== 0 ? (1.0 - (quota * valI2) / denom) : 0.0;
      stake = factor * F;
    }

    const resStr = step < sequence.length ? sequence[step] : '';
    if (!resStr) {
      trades.push({
        tradeIndex: step + 1,
        result: '',
        stakeAmount: Math.round(stake * 100) / 100,
        portfolioBalance: null,
      });
      break;
    }

    const isWin = resStr.toLowerCase() === 'w';
    let netReturn, INext, HNext;
    if (isWin) {
      netReturn = stake * (quota - 1.0);
      F = F + netReturn;
      INext = I + 1;
      HNext = H;
    } else {
      netReturn = -stake;
      F = F + netReturn;
      HNext = H + 1;
      INext = I;
    }

    trades.push({
      tradeIndex: step + 1,
      result: resStr.toLowerCase(),
      stakeAmount: Math.round(stake * 100) / 100,
      portfolioBalance: Math.round(F * 100) / 100,
    });

    if (INext >= expectedWins || HNext === (1 + totalEvents - expectedWins)) {
      H = 0;
      I = 0;
    } else {
      H = HNext;
      I = INext;
    }
  }

  return trades;
}

/**
 * Returns the exact next trade stake amount for the current session sequence.
 */
export function getNextTradeStake(capital, totalEvents, expectedWins, quota, sequence = []) {
  const trades = calculateMasanielloJS(capital, totalEvents, expectedWins, quota, sequence);
  return trades[trades.length - 1]?.stakeAmount ?? 0;
}
