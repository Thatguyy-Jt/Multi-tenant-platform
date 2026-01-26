/**
 * Cookie utility functions
 * Standardizes cookie configuration across the application
 */

import logger from './logger.js';

/**
 * Get cookie options based on environment
 * @returns {Object} Cookie options
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For cross-origin requests (different domains), we need sameSite: 'none' with secure: true
  // sameSite: 'strict' only works for same-site requests
  // sameSite: 'none' requires secure: true (HTTPS)
  return {
    httpOnly: true,
    secure: isProduction, // Required for sameSite: 'none' and HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin, 'lax' for development
    path: '/',
    // Don't set domain for cross-origin cookies - let browser handle it
    // Setting domain restricts which domains can receive the cookie
  };
};

/**
 * Set authentication token cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {number} maxAge - Max age in milliseconds (default: 7 days)
 */
export const setAuthCookie = (res, token, maxAge = 7 * 24 * 60 * 60 * 1000) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookies.js:34',message:'setAuthCookie ENTRY',data:{hasToken:!!token,tokenLength:token?.length,maxAge},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const options = {
    ...getCookieOptions(),
    maxAge,
  };
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookies.js:42',message:'Cookie options BEFORE res.cookie',data:{secure:options.secure,sameSite:options.sameSite,httpOnly:options.httpOnly,path:options.path,maxAge:options.maxAge,hasDomain:!!options.domain,domain:options.domain},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Log cookie configuration for debugging
  logger.info('Setting auth cookie', {
    secure: options.secure,
    sameSite: options.sameSite,
    httpOnly: options.httpOnly,
    path: options.path,
    maxAge: maxAge,
    hasToken: !!token,
    tokenLength: token?.length,
  });
  
  // #region agent log
  const headersBefore = res.getHeader('Set-Cookie');
  fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookies.js:58',message:'Set-Cookie header BEFORE res.cookie',data:{hasHeader:!!headersBefore,headerValue:Array.isArray(headersBefore)?headersBefore[0]:headersBefore},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  res.cookie('token', token, options);
  
  // #region agent log
  const headersAfter = res.getHeader('Set-Cookie');
  const allHeaders = res.getHeaders();
  fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookies.js:66',message:'Set-Cookie header AFTER res.cookie',data:{hasHeader:!!headersAfter,headerValue:Array.isArray(headersAfter)?headersAfter[0]:headersAfter,allSetCookieHeaders:Array.isArray(headersAfter)?headersAfter:headersAfter?[headersAfter]:[],responseHeadersCount:Object.keys(allHeaders).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Verify cookie was set by checking response headers
  const setCookieHeader = res.getHeader('Set-Cookie');
  logger.info('Cookie set in response', {
    hasSetCookieHeader: !!setCookieHeader,
    setCookieValue: Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader,
  });
};

/**
 * Clear authentication token cookie
 * @param {Object} res - Express response object
 */
export const clearAuthCookie = (res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    expires: new Date(0),
  });
};
