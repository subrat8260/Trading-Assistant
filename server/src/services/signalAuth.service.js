import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar, Cookie } from 'tough-cookie';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';

/**
 * Service managing Signal24x7 authentication, cookie jar, and static session persistence
 */
class SignalAuthService {
  constructor() {
    this.baseUrl = 'https://signal24x7.com';
    this.jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        jar: this.jar,
        withCredentials: true,
        timeout: 25000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en,en-US;q=0.9',
          Origin: 'https://signal24x7.com',
          Referer: 'https://signal24x7.com/dashboard/',
        },
      })
    );

    // Pre-populate session state with static Signal24x7 credentials from config
    this.sessionState = {
      isLoggedIn: false,
      lastActiveTime: null,
      savedCookieString: null,
      savedCredentials: {
        username: config.signal24x7.username,
        password: config.signal24x7.password,
      },
    };
  }

  /**
   * Helper to set cookie string into tough-cookie jar
   */
  async setCookieString(cookieString) {
    if (!cookieString) return;
    this.sessionState.savedCookieString = cookieString;

    const cookies = cookieString.split(';');
    for (const cookieStr of cookies) {
      const trimmed = cookieStr.trim();
      if (!trimmed) continue;
      try {
        const cookie = Cookie.parse(trimmed);
        if (cookie) {
          await this.jar.setCookie(cookie, this.baseUrl);
        }
      } catch (_err) {
        // Ignore unparseable cookie strings
      }
    }
  }

  /**
   * Authenticate session using Cookie string or static Username/Password
   */
  async login({ sessionCookie, username, password } = {}) {
    const targetUsername = username || this.sessionState.savedCredentials?.username || config.signal24x7.username;
    const targetPassword = password || this.sessionState.savedCredentials?.password || config.signal24x7.password;

    if (sessionCookie) {
      await this.setCookieString(sessionCookie);
    } else if (targetUsername && targetPassword) {
      this.sessionState.savedCredentials = { username: targetUsername, password: targetPassword };
      
      // Perform WordPress login POST
      const loginParams = new URLSearchParams({
        log: targetUsername,
        pwd: targetPassword,
        'wp-submit': 'Log In',
        redirect_to: 'https://signal24x7.com/dashboard/',
        rememberme: 'forever',
      });

      await this.client.post(`${this.baseUrl}/wp-login.php`, loginParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }

    // Verify session by requesting dashboard
    const isSessionActive = await this.verifySession();
    if (!isSessionActive) {
      throw new AppError('Failed to authenticate static session with Signal24x7.', 401);
    }

    this.sessionState.isLoggedIn = true;
    this.sessionState.lastActiveTime = new Date().toISOString();

    return this.getStatus();
  }

  /**
   * Check if current session cookie is valid on Signal24x7 dashboard
   */
  async verifySession() {
    try {
      const response = await this.client.get(`${this.baseUrl}/dashboard/`);
      const html = response.data || '';

      const isLoggedIn =
        html.includes('logged-in') ||
        html.includes('Select Currency Pair') ||
        html.includes('Generate Signal') ||
        html.includes('dis-box');

      return Boolean(isLoggedIn);
    } catch (error) {
      console.warn('[SignalAuthService] Session verification error:', error.message);
      return false;
    }
  }

  /**
   * Ensure active session before making request, re-authenticating if needed
   */
  async ensureAuthenticated() {
    if (this.sessionState.isLoggedIn) {
      const isValid = await this.verifySession();
      if (isValid) return true;
    }

    // Automatically log in with static configured credentials
    console.log('[SignalAuthService] Authenticating Signal24x7 with static configured credentials...');
    await this.login();
    return true;
  }

  /**
   * Get current session status
   */
  getStatus() {
    return {
      isLoggedIn: this.sessionState.isLoggedIn,
      lastActiveTime: this.sessionState.lastActiveTime,
      activeUser: this.sessionState.savedCredentials?.username || config.signal24x7.username,
      hasSavedCookie: Boolean(this.sessionState.savedCookieString),
      hasSavedCredentials: Boolean(this.sessionState.savedCredentials),
    };
  }

  /**
   * Logout and clear cookie jar
   */
  async logout() {
    await this.jar.removeAllCookies();
    this.sessionState = {
      isLoggedIn: false,
      lastActiveTime: null,
      savedCookieString: null,
      savedCredentials: {
        username: config.signal24x7.username,
        password: config.signal24x7.password,
      },
    };
    return { message: 'Logged out from Signal24x7 successfully' };
  }

  /**
   * Get authenticated Axios client instance
   */
  getClient() {
    return this.client;
  }
}

export default new SignalAuthService();
