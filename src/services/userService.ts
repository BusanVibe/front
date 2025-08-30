import { CONFIG } from '../config';
import { MyPageDto, MyPageResponse } from '../types/user';

export class UserService {
  private static baseUrl = CONFIG.API_BASE_URL;

  static async getMyPage(accessToken: string): Promise<MyPageDto> {
    const url = `${this.baseUrl}api/users/mypage`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('마이페이지 API 실패:', response.status, response.statusText, responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MyPageResponse = JSON.parse(responseText);

      if (!data.is_success || !data.result) {
        console.error('마이페이지 API 비정상 응답:', data);
        throw new Error('마이페이지 데이터 로드 실패');
      }

      return data.result;
    } catch (error) {
      console.error('마이페이지 API 호출 중 오류:', error);
      throw error;
    }
  }
}

export default UserService;


