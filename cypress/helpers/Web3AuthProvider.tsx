import EncryptedStorage from 'react-native-encrypted-storage';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import Web3Auth, {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';

const WEB3AUTH_CLIENTID =
  'BCTSBrn61jL_KXD6ZJURT65r8XBr9FNGvMjOrFqkHBNnq-z00Qa5Q1jO1B-1qUzXEo_AlezGqL2zmcMJbslMSEo';
const scheme = 'app.cypresslabs.ios';
const redirectUrl = `${scheme}://auth`;
export const web3AuthLoginOptions = {
  loginProvider: LOGIN_PROVIDER.GOOGLE,
  redirectUrl: redirectUrl,
};

export const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
  clientId: WEB3AUTH_CLIENTID, // Get your Client ID from the Web3Auth Dashboard
  network: 'sapphire_devnet',
});
