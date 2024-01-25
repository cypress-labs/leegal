'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.SimpleNet = void 0;
const axios_1 = require('axios');
const simple_websocket_reader_1 = require('./simple-websocket-reader');
const url_1 = require('url');
const http_1 = require('http');
const https_1 = require('https');
/** class simply implements Net interface */
class SimpleNet {
  constructor(baseURL, timeout = 30 * 1000, wsTimeout = 30 * 1000) {
    this.baseURL = baseURL;
    this.wsTimeout = wsTimeout;
    this.axios = axios_1.default.create({
      baseURL,
      timeout,
    });
  }
  http(method, path, params) {
    return __awaiter(this, void 0, void 0, function* () {
      params = params || {};
      try {
        const resp = yield this.axios.request({
          method,
          url: path,
          data: params.body,
          headers: params.headers,
          params: params.query,
        });
        if (params.validateResponseHeader) {
          params.validateResponseHeader(resp.headers);
        }
        return resp.data;
      } catch (err) {
        if (err.isAxiosError) {
          throw convertError(err);
        }
        throw new Error(
          `${method} ${url_1.resolve(this.baseURL, path)}: ${err.message}`,
        );
      }
    });
  }
  openWebSocketReader(path) {
    const url = url_1
      .resolve(this.baseURL, path)
      .replace(/^http:/i, 'ws:')
      .replace(/^https:/i, 'wss:');
    return new simple_websocket_reader_1.SimpleWebSocketReader(
      url,
      this.wsTimeout,
    );
  }
}
exports.SimpleNet = SimpleNet;
function convertError(err) {
  if (err.response) {
    const resp = err.response;
    if (typeof resp.data === 'string') {
      let text = resp.data.trim();
      if (text.length > 50) {
        text = text.slice(0, 50) + '...';
      }
      return new Error(
        `${resp.status} ${err.config.method} ${err.config.url}: ${text}`,
      );
    } else {
      return new Error(`${resp.status} ${err.config.method} ${err.config.url}`);
    }
  } else {
    return new Error(`${err.config.method} ${err.config.url}: ${err.message}`);
  }
}
