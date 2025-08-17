/*
 * MIT License
 * Copyright (c) 2025 Feral File
 * See LICENSE file in the project root for full license information.
 */

/*
 * FeralFile Artwork JS Library
 * -----------------------------------
 * Get Feral File URL Parameters.
 * Provides provenance, blockchain info, and deterministic random number for FeralFile artworks via URL params.
 *
 * Usage:
 *   <head>
 *     <script src="artwork_lib.js"></script>
 *   </head>
 *   <body>
 *   <script>
 *     window.addEventListener('feralfile:provenance-ready', (e) => {
 *       console.log('Provenance:', e.detail.provenances);
 *     });
 *
 *     window.addEventListener('feralfile:blockchain-info-ready', (e) => {
 *       console.log('Block height:', e.detail.height);
 *     });
 *
 *     // Load data
 *     FeralFile.loadProvenance();
 *     FeralFile.loadBlockchainInfo();
 *
 *     // Get variables and deterministic random number
 *     console.log(FeralFile.getVariables());
 *     console.log(FeralFile.random());
 *   </script>
 *   </body>
 *
 * API:
 *   FeralFile.loadProvenance(): void
 *     - Dispatches 'feralfile:provenance-ready' or 'feralfile:provenance-request-error'
 *   FeralFile.loadBlockchainInfo(): void
 *     - Dispatches 'feralfile:blockchain-info-ready' or 'feralfile:blockchain-info-request-error'
 *   FeralFile.random(): number
 *     - Returns a deterministic random number seeded by token_id
 *   FeralFile.getVariables(): object
 *     - Returns configuration variables (blockchain, contract, tokenID, etc.)
 *
 * Events:
 *   'feralfile:provenance-ready' { detail: { provenances: any } }
 *   'feralfile:provenance-request-error' { detail: { error: Error } }
 *   'feralfile:blockchain-info-ready' { detail: { height: number } }
 *   'feralfile:blockchain-info-request-error' { detail: { error: Error } }
 *
 * URL Parameters:
 *   - blockchain - (ethereum | tezos)
 *   - contract - Contract address if any
 *   - token_id - A unique ID of a token in the blockchain. It is decimal in Tezos and Ethereum
 *   - edition_number - The edition number of the artwork
 *   - artwork_number - The artwork number within the series
 *
 * License: MIT
 */

(function(global) {
  'use strict';

  /**
   * Generate a random token ID if not provided in URL.
   * @returns {string}
   */
  function randomTokenId() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
  }

  // Read config from URL
  const searchParams = new URLSearchParams(window.location.search);
  const blockchain = searchParams.get('blockchain') || 'ethereum';
  const contract = searchParams.get('contract') || '';
  const tokenID = searchParams.get('token_id') || randomTokenId();
  const editionNumber = parseInt(searchParams.get('edition_number') || '0');
  const artworkNumber = parseInt(searchParams.get('artwork_number') || '1');

  /**
   * Get blockchain alias for API usage.
   * @param {string} blockchainType
   * @returns {string}
   */
  function blockchainAlias(blockchainType) {
    switch (blockchainType) {
    case 'tezos':
      return 'tez';
    case 'ethereum':
      return 'eth';
    default:
      return 'eth';
    }
  }

  /**
   * Simple HTTP request helper (XHR, Promise-based)
   * @param {string} url
   * @param {string} method
   * @param {object} [body]
   * @returns {Promise<any>}
   */
  function simpleHTTPRequest(url, method, body) {
    return new Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      const xhrParams = body ? JSON.stringify(body) : null;
      if (xhrParams) {
        xhr.setRequestHeader('content-type', 'application/json');
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 400) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error('response is not ok. status: ' + xhr.status));
          }
        }
      };
      xhr.onerror = function(e) {
        reject(e);
      };
      xhr.send(xhrParams);
    });
  }

  /**
   * Get Feral File Variables
   * These variables are passed as URL parameters to the artwork.
   */
  function getVariables() {
    return {
      editionNumber,
      artworkNumber,
      blockchain,
      contract,
      tokenID,
    };
  }

  /**
   * Fetch provenance info and dispatch events.
   * @fires feralfile:provenance-ready
   * @fires feralfile:provenance-request-error
   */
  function loadProvenance() {
    if (!blockchain || !contract || !tokenID) {
      global.dispatchEvent(new CustomEvent('feralfile:provenance-request-error', {
        detail: { error: new Error('Cannot load provenance: missing blockchain, contract, or tokenID') }
      }));
      return;
    }

    const url = 'https://indexer.feralfile.com/v2/nft/query';
    const indexID = [blockchainAlias(blockchain), contract, tokenID].join('-');
    const reqBody = { ids: [indexID] };

    simpleHTTPRequest(url, 'POST', reqBody)
      .then(function(data) {
        if (!Array.isArray(data) || data.length === 0) {
          global.dispatchEvent(new CustomEvent('feralfile:provenance-request-error', {
            detail: { error: new Error('token not found') }
          }));
          return;
        }
        global.dispatchEvent(new CustomEvent('feralfile:provenance-ready', {
          detail: { provenances: data[0].provenance }
        }));
      })
      .catch(function(error) {
        global.dispatchEvent(new CustomEvent('feralfile:provenance-request-error', {
          detail: { error }
        }));
      });
  }

  /**
   * Fetch blockchain info and dispatch events.
   * @fires feralfile:blockchain-info-ready
   * @fires feralfile:blockchain-info-request-error
   */
  function loadBlockchainInfo() {
    simpleHTTPRequest('https://api.blockcypher.com/v1/eth/main', 'GET')
      .then(function(data) {
        global.dispatchEvent(new CustomEvent('feralfile:blockchain-info-ready', {
          detail: { height: data.height }
        }));
      })
      .catch(function(error) {
        global.dispatchEvent(new CustomEvent('feralfile:blockchain-info-request-error', {
          detail: { error }
        }));
      });
  }

  // --- Deterministic Random Number Generator ---

  /**
   * Seed generation function (cyrb128)
   * @param {string} str
   * @returns {number[]}
   */
  function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = (h2 ^ Math.imul(h1 ^ k, 597399067)) | 0;
      h2 = (h3 ^ Math.imul(h2 ^ k, 2869860233)) | 0;
      h3 = (h4 ^ Math.imul(h3 ^ k, 951274213)) | 0;
      h4 = (h1 ^ Math.imul(h4 ^ k, 2716044179)) | 0;
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067) | 0;
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233) | 0;
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213) | 0;
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179) | 0;
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  }

  /**
   * sfc32 random number generator
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @returns {function(): number}
   */
  function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  // Create seed and random function
  const seed = cyrb128(tokenID);
  const random = sfc32(seed[0], seed[1], seed[2], seed[3]);

  /**
   * FeralFile global API
   * @namespace FeralFile
   */
  global.FeralFile = {
    loadProvenance,
    loadBlockchainInfo,
    random,
    getVariables,
  };

})(window);
