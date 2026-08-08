import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import AppError from '../utils/AppError.js';

const execFilePromise = util.promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service Layer for Excel Workbook Calculation Engine (Clean Architecture)
 * 
 * Documented Cell Mapping (RRMM (1).xlsx):
 * -------------------------------------------------------------
 * Input Cells:
 * - Rajiv Rajput!I4 : Masaniello Type ("normale")
 * - Rajiv Rajput!I5 : Initial Capital (Number)
 * - Rajiv Rajput!I6 : Total Events / Target Trades Count (N)
 * - Rajiv Rajput!I7 : Expected Win Trades Target (K)
 * - Rajiv Rajput!I8 : Quota / Odds (Q)
 * - Rajiv Rajput!C5:C104 : Trade Results Sequence ('w' / 'l')
 * 
 * Output Cells:
 * - Rajiv Rajput!J7  : Target Win Ratio (K / N)
 * - Rajiv Rajput!I11 : Final Capital ($)
 * - Rajiv Rajput!I12 : Total Profit Ratio (%)
 * - Rajiv Rajput!I13 : Total Win Profit ($)
 * - Rajiv Rajput!I16 : Executed Wins Count
 * - Rajiv Rajput!I17 : Executed Losses Count
 * - Rajiv Rajput!J16 : Executed Win Rate (%)
 * - Rajiv Rajput!J17 : Executed Loss Rate (%)
 * - Rajiv Rajput!D5:D104 : Calculated Recommended Stake Amount ($)
 * - Rajiv Rajput!E5:E104 : Net Trade Profit/Loss ($)
 * - Rajiv Rajput!F5:F104 : Current Bankroll / Portfolio Balance ($)
 */
class ExcelService {
  /**
   * Process Excel calculation using native COM / Excel engine runner
   * @param {Object} params - Calculation parameters
   */
  async calculateMasaniello(params = {}) {
    const pythonScript = path.resolve(__dirname, '../scripts/excel_runner.py');
    const workbookPath = path.resolve(__dirname, '../../../RRMM (1).xlsx');

    const inputData = {
      excelPath: workbookPath,
      initialCapital: params.initialCapital ?? 100,
      totalEvents: params.totalEvents ?? 6,
      expectedWins: params.expectedWins ?? 1,
      quota: params.quota ?? 1.82,
      masanielloType: params.masanielloType || 'normale',
      tradeResults: params.tradeResults || [],
    };

    try {
      const { stdout, stderr } = await execFilePromise('python', [
        pythonScript,
        JSON.stringify(inputData),
      ]);

      if (stderr && stderr.trim() !== '') {
        console.warn('[ExcelService Python Warning]:', stderr);
      }

      const result = JSON.parse(stdout);
      if (result.status === 'error') {
        throw new AppError(`Excel Calculation Failed: ${result.message}`, 500);
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[ExcelService Error]:', error);
      throw new AppError(
        `Failed to execute Excel workbook engine: ${error.message}`,
        500
      );
    }
  }
}

export default new ExcelService();
