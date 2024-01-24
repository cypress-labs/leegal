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
const simple_websocket_reader_1 = require('./simple-websocket-reader');
const url_1 = require('url');
/** class simply implements Net interface */
class SimpleNet {
  constructor(baseURL, timeout = 30 * 1000, wsTimeout = 30 * 1000) {
    this.baseURL = baseURL;
    this.wsTimeout = wsTimeout;
  }
  async http(method, path, params) {
    params = params || {};
    const url = new URL(path, this.baseURL);

    try {
      const response = await fetch(url.href, {
        method,
        body: params.body,
        headers: params.headers,
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${method} ${url.href}`);
      }

      const data = await response.json();

      if (params.validateResponseHeader) {
        params.validateResponseHeader(response.headers);
      }

      return data;
    } catch (err) {
      throw new Error(`${method} ${url.href}: ${err.message}`);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLW5ldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zaW1wbGUtbmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLGlDQUF3RDtBQUN4RCx1RUFBaUU7QUFDakUsNkJBQTZCO0FBQzdCLCtCQUF5QztBQUN6QyxpQ0FBMkM7QUFFM0MsNENBQTRDO0FBQzVDLE1BQWEsU0FBUztJQUdsQixZQUNhLE9BQWUsRUFDeEIsT0FBTyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQ0YsWUFBWSxFQUFFLEdBQUcsSUFBSTtRQUY3QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBRVAsY0FBUyxHQUFULFNBQVMsQ0FBWTtRQUV0QyxJQUFJLENBQUMsS0FBSyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7WUFDdEIsU0FBUyxFQUFFLElBQUksWUFBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQzdDLFVBQVUsRUFBRSxJQUFJLGFBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUMvQyxPQUFPO1lBQ1AsT0FBTztTQUNWLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFWSxJQUFJLENBQ2IsTUFBc0IsRUFDdEIsSUFBWSxFQUNaLE1BQW1COztZQUNuQixNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQTtZQUNyQixJQUFJO2dCQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7b0JBQ2xDLE1BQU07b0JBQ04sR0FBRyxFQUFFLElBQUk7b0JBQ1QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO29CQUNqQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87b0JBQ3ZCLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSztpQkFDdkIsQ0FBQyxDQUFBO2dCQUNGLElBQUksTUFBTSxDQUFDLHNCQUFzQixFQUFFO29CQUMvQixNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2lCQUM5QztnQkFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7YUFDbkI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixJQUFJLEdBQUcsQ0FBQyxZQUFZLEVBQUU7b0JBQ2xCLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2lCQUMxQjtnQkFDRCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsTUFBTSxJQUFJLGFBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2FBQzlFO1FBQ0wsQ0FBQztLQUFBO0lBQ00sbUJBQW1CLENBQUMsSUFBWTtRQUNuQyxNQUFNLEdBQUcsR0FBRyxhQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUM7YUFDbEMsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7YUFDekIsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNoQyxPQUFPLElBQUksK0NBQXFCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUN6RCxDQUFDO0NBQ0o7QUE5Q0QsOEJBOENDO0FBRUQsU0FBUyxZQUFZLENBQUMsR0FBZTtJQUNqQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7UUFDZCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBO1FBQ3pCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7Z0JBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7YUFDbkM7WUFDRCxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQ3JGO2FBQU07WUFDSCxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7U0FDNUU7S0FDSjtTQUFNO1FBQ0gsT0FBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0tBQzdFO0FBQ0wsQ0FBQyJ9

