/**
 * 부산 톡 채팅 서비스
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

export type ChatType = 'CHAT' | 'BOT';

export interface ChatMessage {
  user_id: number;
  name: string;
  image_url: string;
  message: string;
  time: string; // ISO string
  type: ChatType;
}

export interface SendChatResponse {
  is_success: boolean;
  code: string;
  message: string;
  result: ChatMessage;
}

export interface ChatHistoryResponseRaw {
  is_success: boolean;
  code: string;
  message: string;
  result: any;
}

export interface ChatHistoryPage {
  messages: ChatMessage[];
  cursorId: string | null;
}

const buildHeaders = async () => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  } as Record<string, string>;
};

export class ChatService {
  private static baseUrl = CONFIG.API_BASE_URL;

  /**
   * 채팅 메시지 전송
   * - '/' 로 시작하면 챗봇 응답을 API 응답으로 반환
   * - 일반 채팅은 웹소켓으로 브로드캐스트됨
   */
  static async send(message: string): Promise<SendChatResponse> {
    if (!message || message.trim().length === 0) {
      throw new Error('메시지를 입력해주세요.');
    }
    if (message.length > 200) {
      throw new Error('메시지는 200자 이하여야 합니다.');
    }

    const url = `${this.baseUrl}api/chat/send`;
    const headers = await buildHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`채팅 전송 실패: ${response.status} ${text}`);
    }

    try {
      const data: SendChatResponse = JSON.parse(text);
      // 안전 로그 (민감정보 제외)
      console.log('=== Chat Send API ===');
      console.log('endpoint:', url);
      console.log('request:', { messageLength: message.length, isBotQuery: message.startsWith('/') });
      console.log('response:', {
        is_success: data.is_success,
        code: data.code,
        message: data.message,
        result: {
          user_id: data.result?.user_id,
          name: data.result?.name,
          image_url: !!data.result?.image_url,
          message: data.result?.message?.slice(0, 80),
          time: data.result?.time,
          type: data.result?.type,
        },
      });
      return data;
    } catch (e) {
      throw new Error(`응답 파싱 실패: ${text}`);
    }
  }

  /**
   * 채팅 히스토리 조회 (cursor 기반 페이지네이션)
   */
  static async history(cursorId: string | null = null, pageSize: number = 30): Promise<ChatHistoryPage> {
    const size = Math.min(Math.max(pageSize, 1), 30);
    // React Native(Hermes)에서 URL/URLSearchParams 미지원 이슈가 있어 수동 구성
    let query = `?page-size=${encodeURIComponent(String(size))}`;
    if (cursorId !== null && cursorId !== undefined && String(cursorId).trim() !== '') {
      query += `&cursor-id=${encodeURIComponent(String(cursorId))}`;
    }
    const url = `${this.baseUrl}api/chat/history${query}`;

    const headers = await buildHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`히스토리 조회 실패: ${response.status} ${text}`);
    }

    let raw: ChatHistoryResponseRaw;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new Error(`응답 파싱 실패: ${text}`);
    }

    // 다양한 응답 형태 방어적 파싱
    const result = raw.result ?? {};
    const nextCursor = result.cursor_id ?? result.cursorId ?? null;

    let messages: ChatMessage[] = [];

    if (Array.isArray(result.messages)) {
      messages = result.messages as ChatMessage[];
    } else if (Array.isArray(result.result_list)) {
      // 백엔드 예시가 다른 스키마일 수 있어 최소 필드 매핑 시도
      messages = (result.result_list as any[]).map((item, index) => ({
        user_id: item.user_id ?? 0,
        name: item.name ?? '알 수 없음',
        image_url: item.image_url ?? '',
        message: item.message ?? item.text ?? '',
        time: item.time ?? new Date().toISOString(),
        type: (item.type as ChatType) ?? 'CHAT',
      }));
    } else if (result.chat_list) {
      // 서버가 Java 직렬화 호환 형태로 반환하는 경우 처리
      // chat_list: ["java.util.ArrayList", [ { user_name, user_image, content, date_time, is_my }, ... ]]
      const rawList = result.chat_list as any;
      let items: any[] = [];
      if (Array.isArray(rawList) && Array.isArray(rawList[1])) {
        items = rawList[1] as any[];
      } else if (Array.isArray(rawList)) {
        items = rawList as any[];
      }

      messages = items.map((item: any) => {
        const iso = (() => {
          try {
            // date_time 예: 2025-08-19T06:22:29.288
            const d = new Date(item?.date_time);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
          } catch {
            return new Date().toISOString();
          }
        })();

        return {
          user_id: 0,
          name: item?.user_name ?? '알 수 없음',
          image_url: item?.user_image ?? '',
          message: item?.content ?? '',
          time: iso,
          // 내 메시지는 CHAT, 다른 사람 메시지는 왼쪽 정렬을 위해 BOT 취급
          type: item?.is_my ? 'CHAT' as ChatType : 'BOT' as ChatType,
        } as ChatMessage;
      });
    } else {
      messages = [];
    }

    // 안전 로그 (민감정보 제외)
    console.log('=== Chat History API ===');
    console.log('endpoint:', url);
    console.log('response:', {
      is_success: raw.is_success,
      code: raw.code,
      message: raw.message,
      cursorId: nextCursor,
      messagesCount: messages.length,
      firstMessagePreview: messages[0]?.message?.slice(0, 80),
      lastMessagePreview: messages[messages.length - 1]?.message?.slice(0, 80),
    });

    return { messages, cursorId: nextCursor };
  }
}

export default ChatService;


