# FeralFile Artwork JS Library
-----------------------------------
A lightweight, dependency-free JavaScript library for software artworks on Feral File, enabling software artwork developers to create variants by integrating this library.
Inspired by fxhash, this library is designed as a simple snippet that can be included at the top of generative artworks.

- Fetch provenance information from the Feral File indexer
- Retrieve blockchain chain height from BlockCypher API
- Deterministic random number generator seeded by `token_id`
- Zero dependencies, optimized for browser embedding

### Table of contents
- [Installation](#installation)
- [Quickstart](#quickstart)
- [Functions](#functions)
- [Events](#events)
- [URL Parameters](#url-parameters)
- [Deterministic Randomness](#deterministic-randomness)
- [Network Endpoints](#network-endpoints)
- [Notes](#notes)
- [License](#license-mit)

### Installation
  Load the library via CDN by adding the script tag to your HTML:
  ```html
  <script src="https://ipfs.bitmark.com/ipfs/QmRfJutL1FyAKqT2vAAPErgcJqTfCyWvQtnbiShZhTkNL4" type="text/javascript"></script>
  ```

  The script attaches a global:
  ```js
  window.FeralFile // { loadProvenance, loadBlockchainInfo, random, getVariables }
  ```

### Quickstart
  ```html
  <head>
    <script src="https://ipfs.bitmark.com/ipfs/QmRfJutL1FyAKqT2vAAPErgcJqTfCyWvQtnbiShZhTkNL4" type="text/javascript"></script>
  </head>
  <body>
    <script>
      // Listen for results:
      window.addEventListener('feralfile:provenance-ready', (e) => {
        console.log('Provenance:', e.detail.provenances);
      });
      
      window.addEventListener('feralfile:blockchain-info-ready', (e) => {
        console.log('Block height:', e.detail.height);
      });
      
      // Load data, Kick off requests:
      FeralFile.loadProvenance();
      FeralFile.loadBlockchainInfo();
      
      // Get variables and deterministic random number
      console.log(FeralFile.getVariables());
      console.log(FeralFile.random());
    </script>
  </body>
  ```

#### Provenance Data Example
```json
  [
    {
      "type": "transfer",
      "owner": "0x5151f4b48CeE4f7dcB7714E7b4b836aa847Bf4e8",
      "blockchain": "ethereum",
      "blockNumber": 20134677,
      "timestamp": "2024-06-20T18:18:23Z",
      "txid": "0x52750ea1b7efeece11e8d10f2b5c0e3f4db854b6e8eac8e82f89b03a2b39f52f",
      "txURL": "https://etherscan.io/tx/0x52750ea1b7efeece11e8d10f2b5c0e3f4db854b6e8eac8e82f89b03a2b39f52f"
    },
    {
      "type": "mint",
      "owner": "0x457ee5f723C7606c12a7264b52e285906F91eEA6",
      "blockchain": "ethereum",
      "blockNumber": 18582877,
      "timestamp": "2023-11-16T07:12:59Z",
      "txid": "0xedfc4eca7c95911ee7c07cdfda14361998d84e5ea812404d42279665c0c74cf1",
      "txURL": "https://etherscan.io/tx/0xedfc4eca7c95911ee7c07cdfda14361998d84e5ea812404d42279665c0c74cf1"
    }
  ]
```

### Functions
  - `FeralFile.loadProvenance()`: void
    - Dispatches 'feralfile:provenance-ready' or 'feralfile:provenance-request-error'
  - `FeralFile.loadBlockchainInfo()`: void
    - Dispatches 'feralfile:blockchain-info-ready' or 'feralfile:blockchain-info-request-error'
  - `FeralFile.random()`: number
    - Returns a deterministic random number seeded by token_id
  - `FeralFile.getVariables()`: object
    - Returns configuration variables {
      blockchain: string, contract: string, tokenID: string,
      editionNumber: number, artworkNumber: number
    }

### Events
The SDK emits DOM events on window:
  - `feralfile:provenance-ready` → { detail: { provenances: any } }
  - `feralfile:provenance-request-error` → { detail: { error: Error } }
  - `feralfile:blockchain-info-ready` → { detail: { height: number } }
  - `feralfile:blockchain-info-request-error` → { detail: { error: Error } }

### URL Parameters
The library reads these from `window.location.search`:
| Param            | Type   | Notes                                                                      |
| ---------------- | ------ | -------------------------------------------------------------------------- |
| `blockchain`     | string | `"ethereum"` or `"tezos"`                           |
| `contract`       | string | Contract address                                                |
| `token_id`       | string | Used as RNG seed; if missing, a random token is generated (dev-friendly)   |
| `edition_number` | number | The edition number of the artwork                                                   |
| `artwork_number` | number | The artwork number within the series                                         |

To access parsed values:
```js
const vars = FeralFile.getVariables();
```
### Deterministic Randomness
To provide randomness to generative artworks, we offer a random function based on sfc32. The function takes token_id (passed as a URL parameter) as the seed of the randomness. This ensures that the randomness is deterministic. If the token_id is not given, the snippet will create a random one so you can test locally.

Use `FeralFile.random()` to get a deterministic random value in [0,1), seeded by `token_id`. This is implemented with a cyrb128 hash → sfc32 PRNG.

> **Warning**: When designing your randomness, ensure it remains deterministic based on the given `token_id`; otherwise, the artwork may change with each page reload.

### Network endpoints
- Feral File Indexer, request to get provenances (POST) — https://indexer.feralfile.com/v2/nft/query
- Ethereum height (GET) — https://api.blockcypher.com/v1/eth/main

### Notes
- The HTTP helper uses XMLHttpRequest and JSON parsing; non-2xx responses reject with `"response is not ok"` and invalid JSON rejects with `"Invalid JSON response"`. 
- If any of blockchain, contract, or token_id is missing, the provenance request does not run and an error event is dispatched. 
- Only support Ethereum chain height.

### License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)  
This project is licensed under the [MIT License](./LICENSE).

## Attribution

Copyright (c) 2025 Feral File  
See the LICENSE file for details.

---

**Note:** Feral File and associated trademarks are property of their respective owners.  
Use of these names does not imply endorsement.