import * as cheerio from 'cheerio';
import signalAuthService from './signalAuth.service.js';
import AppError from '../utils/AppError.js';

/**
 * Service Layer for Signal24x7 Signal Generation & Parsing (Clean Architecture)
 */
class SignalService {
  /**
   * Parse returned HTML response using Cheerio
   */
  parseSignalHtml(html) {
    const $ = cheerio.load(html);

    let currencyPair = '';
    let expirationTime = '';
    let signalStrength = '';
    let currencyAnalyzer = '';
    let signal = '';

    // Extract values from div.dis-box p elements
    $('.dis-box p').each((_, el) => {
      const text = $(el).text();
      const spanText = $(el).find('span').text().trim();

      if (text.includes('Currency pair')) {
        currencyPair = spanText;
      } else if (text.includes('Expiration time')) {
        expirationTime = spanText;
      } else if (text.includes('Signal strength')) {
        signalStrength = spanText;
      } else if (text.includes('Currency analyzer')) {
        currencyAnalyzer = spanText;
      } else if (text.includes('Signal')) {
        signal = spanText;
      }
    });

    // Fallback extraction from header text if dis-box span is empty
    if (!currencyPair) {
      const headerText = $('h2:contains("Analysis")').text().trim();
      if (headerText) {
        currencyPair = headerText.replace('Analysis', '').trim();
      }
    }

    return {
      currencyPair,
      signal,
      signalStrength,
      currencyAnalyzer,
      expirationTime,
    };
  }

  /**
   * Reproduce network requests and generate trading signal
   */
  async generateSignal({
    currencyPair = 'USD/BDT (OTC)',
    time = '01:00',
    news = 'neutral',
    volatility = 'High',
    options = ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'],
  } = {}) {
    // 1. Ensure authenticated session
    await signalAuthService.ensureAuthenticated();
    const client = signalAuthService.getClient();

    // 2. Request 1: Select & Analyze Currency Pair
    const req1Payload = `currency=${encodeURIComponent(currencyPair)}&Analyze=Analyze`;
    
    await client.post('https://signal24x7.com/dashboard/', req1Payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 3. Request 2: Generate Signal POST request
    const optionsQuery = options
      .map((opt) => `options%5B%5D=${encodeURIComponent(opt)}`)
      .join('&');

    const req2Payload = `${optionsQuery}&time=${encodeURIComponent(
      time
    )}&currency=${encodeURIComponent(currencyPair)}&news=${encodeURIComponent(
      news
    )}&volatility=${encodeURIComponent(volatility)}&final=Generate+Signal`;

    const response = await client.post('https://signal24x7.com/dashboard/', req2Payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const html = response.data || '';

    // 4. Parse HTML and extract required fields
    const parsedSignal = this.parseSignalHtml(html);

    if (!parsedSignal.signal && !parsedSignal.currencyPair) {
      throw new AppError(
        'Failed to parse signal from Signal24x7 response HTML. Ensure currency pair is valid.',
        500
      );
    }

    return parsedSignal;
  }
}

export default new SignalService();
