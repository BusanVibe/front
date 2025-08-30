/**
 * @format
 */

// RN Hermes 환경에서 @stomp/stompjs 사용 시 TextEncoder/Decoder 폴리필 필요
import 'fast-text-encoding';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
