import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { ChatMessage } from './chatService';

type MessageHandler = (message: ChatMessage) => void;

class ChatSocketSingleton {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private onMessageHandler: MessageHandler | null = null;

  private buildUrl(): string {
    // 서버는 HTTPS 이므로 WSS 사용
    return 'wss://api.busanvibe.site/ws-chat';
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
      brokerURL: this.buildUrl(),
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
          // 서버 예시 스키마를 ChatMessage로 정규화
          const normalized: ChatMessage = {
            user_id: Number(payload.user_id ?? 0),
            name: String(payload.name ?? ''),
            image_url: String(payload.image_url ?? ''),
            message: String(payload.message ?? ''),
            time: String(payload.time ?? new Date().toISOString()),
            type: (payload.type === 'BOT' ? 'BOT' : 'CHAT'),
          };
          this.onMessageHandler?.(normalized);
        } catch (e) {
          // malformed payload 무시
        }
      });
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
}

export const ChatSocket = new ChatSocketSingleton();


