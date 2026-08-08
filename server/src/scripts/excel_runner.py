import os
import sys
import json
import openpyxl

def clean_val(val):
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return val
    if isinstance(val, str):
        val_str = val.strip()
        if val_str == '' or val_str.startswith('#'):
            return None
        try:
            return float(val_str)
        except ValueError:
            return val_str
    return val

def process_excel(input_data):
    default_excel_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../RRMM (1).xlsx'))
    excel_path = os.path.abspath(input_data.get('excelPath', default_excel_path))

    if not os.path.exists(excel_path):
        return {
            "status": "error",
            "message": f"Excel workbook not found at path: {excel_path}"
        }

    try:
        # Load workbook using openpyxl (Cross-platform for Linux & Windows)
        wb = openpyxl.load_workbook(excel_path, data_only=True)
        ws_alg = wb['algoritmo']

        # Read Pascal matrix N2:DJ101 stored in workbook sheet 'algoritmo'
        matrix = []
        for r in range(2, 102):
            row_vals = []
            for c in range(14, 115):  # Col N (14) to DJ (114)
                row_vals.append(ws_alg.cell(r, c).value)
            matrix.append(row_vals)

        def get_mat(r, c):
            if 0 <= r < len(matrix) and 0 <= c < len(matrix[r]):
                val = matrix[r][c]
                if isinstance(val, (int, float)):
                    return val
            return 1.0

        # Input Parameters
        capital = float(input_data.get('initialCapital', 100))
        total_events = int(input_data.get('totalEvents', 6))
        expected_wins = int(input_data.get('expectedWins', 1))
        quota = float(input_data.get('quota', 1.82))
        trade_results = input_data.get('tradeResults', [])

        target_win_ratio = expected_wins / total_events if total_events > 0 else 0

        # Calculate Masaniello Profit Multiplier from Sheet algoritmo!N2
        profit_multiplier = matrix[0][0] if isinstance(matrix[0][0], (int, float)) else 1.00843534
        final_capital = capital * profit_multiplier
        total_win_profit = final_capital - capital
        total_profit_ratio = profit_multiplier - 1.0

        H, I = 0, 0
        F = capital
        trades_output = []

        actual_wins = 0
        actual_losses = 0

        max_trades = min(100, total_events)

        for step in range(max_trades + 1):
            if I >= expected_wins or H == (1 + total_events - expected_wins):
                break

            r_idx = H + I + 2 - 1
            val_i2 = get_mat(r_idx, I + 2 - 1)
            val_i1 = get_mat(r_idx, I + 1 - 1)

            denom = val_i1 + (quota - 1.0) * val_i2
            factor = (1.0 - quota * val_i2 / denom) if denom != 0 else 0.0

            stake = factor * F
            res_str = trade_results[step] if step < len(trade_results) else ""

            if not res_str:
                # Next trade recommendation
                trades_output.append({
                    "tradeIndex": step + 1,
                    "result": "",
                    "stakeAmount": round(stake, 2),
                    "netReturn": None,
                    "portfolioBalance": None
                })
                break

            is_win = (res_str.lower() == 'w')
            if is_win:
                net_return = stake * (quota - 1.0)
                F = F + net_return
                I += 1
                actual_wins += 1
            else:
                net_return = -stake
                F = F + net_return
                H += 1
                actual_losses += 1

            trades_output.append({
                "tradeIndex": step + 1,
                "result": res_str.lower(),
                "stakeAmount": round(stake, 2),
                "netReturn": round(net_return, 2),
                "portfolioBalance": round(F, 2)
            })

        total_executed = actual_wins + actual_losses
        actual_win_pct = actual_wins / total_executed if total_executed > 0 else 0.0
        actual_loss_pct = actual_losses / total_executed if total_executed > 0 else 0.0

        summary = {
            "initialCapital": capital,
            "totalEvents": total_events,
            "expectedWins": expected_wins,
            "quota": quota,
            "targetWinRatio": target_win_ratio,
            "finalCapital": round(final_capital, 2),
            "totalProfitRatio": round(total_profit_ratio, 4),
            "totalWinProfit": round(total_win_profit, 2),
            "actualWinsCount": actual_wins,
            "actualLossesCount": actual_losses,
            "actualWinPercentage": round(actual_win_pct, 4),
            "actualLossPercentage": round(actual_loss_pct, 4)
        }

        return {
            "status": "success",
            "summary": summary,
            "trades": trades_output
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)
    else:
        input_data = {}

    res = process_excel(input_data)
    print(json.dumps(res))
