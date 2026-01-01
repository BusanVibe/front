import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from './chatService';
import { CONFIG } from '../config';

type MessageHandler = (message: ChatMessage) => void;

class ChatSocketSingleton {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private onMessageHandler: MessageHandler | null = null;

  private buildUrl(token?: string | null): string {
    // SockJS 엔드포인트는 HTTPS 주소 사용 (서버 설정과 일치해야 함)
    const base = CONFIG.WS_CHAT_URL;
    if (token && token.trim().length > 0) {
      return `${base}?token=${encodeURIComponent(token)}`;
    }
    return base;
  }

  public isConnected(): boolean {
    return !!this.client?.connected;
  }

  public async connect(onMessage: MessageHandler): Promise<void> {
    if (this.isConnected()) {
      this.onMessageHandler = onMessage;
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    const client = new Client({
      // SockJS를 통해 WebSocket 핸드셰이크 (서버가 SockJS 엔드포인트 제공)
      webSocketFactory: () => {
        const url = this.buildUrl(token);
        const sock = new SockJS(url);
        return sock as unknown as WebSocket;
      },
      // STOMP CONNECT 프레임에 인증 헤더 포함
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      debug: (msg: string) => {
        // 필요 시 주석 해제하여 디버깅
        // console.log('[STOMP]', msg);
      },
    });

    client.onConnect = () => {
      // 채팅방 구독
      this.subscription = client.subscribe('/sub/chatroom', (frame: IMessage) => {
        try {
          const payload = JSON.parse(frame.body);
          // 타입 정규화
          const rawType = String(payload.type ?? 'CHAT');
          let normalizedType: 'CHAT' | 'BOT_REQUEST' | 'BOT_RESPONSE' = 'CHAT';
          if (rawType === 'CHAT') normalizedType = 'CHAT';
          else if (rawType === 'CHAT_REQUEST' || rawType === 'BOT_REQUEST') normalizedType = 'BOT_REQUEST';
          else if (rawType === 'CHAT_RESPONSE' || rawType === 'BOT_RESPONSE' || rawType === 'BOT') normalizedType = 'BOT_RESPONSE';
          // 서버 예시 스키마를 ChatMessage로 정규화
          const normalized: ChatMessage = {
            user_id: Number(payload.user_id ?? 0),
            name: String(payload.name ?? ''),
            image_url: String(payload.image_url ?? ''),
            message: String(payload.message ?? ''),
            time: String(payload.time ?? new Date().toISOString()),
            type: normalizedType,
          };
          try {
            console.log('[socket][received]', { ts: new Date().toISOString(), payload: normalized });
          } catch {}
          this.onMessageHandler?.(normalized);
        } catch (e) {
          try {
            console.warn('[WARN][RECEIVE_PARSE]', { ts: new Date().toISOString(), stage: 'WS_MESSAGE', detail: 'Malformed payload', error: String(e) });
          } catch {}
        }
      });
      // 에러 채널 구독
      try {
        client.subscribe('/sub/chat/error', (frame: IMessage) => {
          try {
            const payload = JSON.parse(frame.body);
            console.warn('[WARN][CHANNEL_ERROR]', { ts: new Date().toISOString(), stage: 'WS_CHANNEL_ERROR', payload });
          } catch (e) {
            console.warn('[WARN][CHANNEL_ERROR_PARSE]', { ts: new Date().toISOString(), stage: 'WS_CHANNEL_ERROR', error: String(e), body: frame.body });
          }
        });
      } catch {}
    };

    client.onStompError = () => {
      // 브로커 에러시 자동 재연결이 동작(reconnectDelay)
    };

    client.onWebSocketClose = () => {
      this.subscription = null;
    };

    this.client = client;
    this.onMessageHandler = onMessage;
    client.activate();
  }

  public disconnect(): void {
    try {
      this.subscription?.unsubscribe();
    } catch {}
    this.subscription = null;

    if (this.client) {
      try {
        this.client.deactivate();
      } catch {}
      this.client = null;
    }
    this.onMessageHandler = null;
  }

  // 현재 연결 상태 문자열 (디버그용)
  public getStatus(): string {
    if (this.client?.connected) return 'CONNECTED';
    return 'DISCONNECTED';
  }

  // 강제 재연결 (디버그 버튼용)
  public forceReconnect(onMessage?: MessageHandler): void {
    const handler = onMessage || this.onMessageHandler;
    this.disconnect();
    if (handler) {
      setTimeout(() => this.connect(handler), 300);
    }
  }

  // 사전 연결 테스트: SockJS로 핸드셰이크 시도 후 즉시 종료
  public async testConnection(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const url = this.buildUrl(token);
      return await new Promise<boolean>((resolve) => {
        try {
          const sock = new SockJS(url);
          const timer = setTimeout(() => {
            try { (sock as any)?.close?.(); } catch {}
            resolve(false);
          }, 7000);
          (sock as any).onopen = () => {
            clearTimeout(timer);
            try { (sock as any)?.close?.(); } catch {}
            resolve(true);
          };
          (sock as any).onerror = () => {
            clearTimeout(timer);
            try { (sock as any)?.close?.(); } catch {}
            resolve(false);
          };
        } catch {
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  }
}

export const ChatSocket = new ChatSocketSingleton();
