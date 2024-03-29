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
import Axios from 'axios';
import {SimpleWebSocketReader} from './simple-websocket-reader';
import {resolve} from 'url';
import {Agent as HttpAgent} from 'http';
import {Agent as HttpsAgent} from 'https';
/** class simply implements Net interface */
export class SimpleNet {
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
    const url = resolve(this.baseURL, path)
      .replace(/^http:/i, 'ws:')
      .replace(/^https:/i, 'wss:');
    return new SimpleWebSocketReader(url, this.wsTimeout);
  }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLW5ldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zaW1wbGUtbmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLE9BQU8sS0FBb0MsTUFBTSxPQUFPLENBQUE7QUFDeEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDakUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUM3QixPQUFPLEVBQUUsS0FBSyxJQUFJLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUN6QyxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUUzQyw0Q0FBNEM7QUFDNUMsTUFBTSxPQUFPLFNBQVM7SUFHbEIsWUFDYSxPQUFlLEVBQ3hCLE9BQU8sR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUNGLFlBQVksRUFBRSxHQUFHLElBQUk7UUFGN0IsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUVQLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFFdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUM3QyxVQUFVLEVBQUUsSUFBSSxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDL0MsT0FBTztZQUNQLE9BQU87U0FDVixDQUFDLENBQUE7SUFDTixDQUFDO0lBRVksSUFBSSxDQUNiLE1BQXNCLEVBQ3RCLElBQVksRUFDWixNQUFtQjs7WUFDbkIsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUE7WUFDckIsSUFBSTtnQkFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO29CQUNsQyxNQUFNO29CQUNOLEdBQUcsRUFBRSxJQUFJO29CQUNULElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtvQkFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO29CQUN2QixNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUs7aUJBQ3ZCLENBQUMsQ0FBQTtnQkFDRixJQUFJLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRTtvQkFDL0IsTUFBTSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtpQkFDOUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO2FBQ25CO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFO29CQUNsQixNQUFNLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQTtpQkFDMUI7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTthQUM5RTtRQUNMLENBQUM7S0FBQTtJQUNNLG1CQUFtQixDQUFDLElBQVk7UUFDbkMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDO2FBQ2xDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO2FBQ3pCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDaEMsT0FBTyxJQUFJLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDekQsQ0FBQztDQUNKO0FBRUQsU0FBUyxZQUFZLENBQUMsR0FBZTtJQUNqQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7UUFDZCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBO1FBQ3pCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7Z0JBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7YUFDbkM7WUFDRCxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQ3JGO2FBQU07WUFDSCxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7U0FDNUU7S0FDSjtTQUFNO1FBQ0gsT0FBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0tBQzdFO0FBQ0wsQ0FBQyJ9

