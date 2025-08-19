/**
 * Ping 컴포넌트 관련 타입 정의
 */

export interface PingLocation {
  latitude: number;
  longitude: number;
}

export interface PingData {
  id: string;
  location: PingLocation;
  type: 'current-location' | 'search-result' | 'poi' | 'user-marker' | 'custom';
  title: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  icon?: string;
  showPulse?: boolean;
  showInfoWindow?: boolean;
  autoHideInfo?: number; // 밀리초 단위
  onClick?: () => void;
  customStyle?: string;
  zIndex?: number;
}

export interface PingManagerConfig {
  map: any; // 카카오 지도 인스턴스
  pings: PingData[];
  onPingClick?: (ping: PingData) => void;
  onInfoWindowShow?: (ping: PingData) => void;
  onInfoWindowHide?: (ping: PingData) => void;
}

export interface PingInstance {
  id: string;
  data: PingData;
  marker: any; // 카카오 마커 인스턴스
  infoWindow?: any; // 카카오 인포윈도우 인스턴스
  isInfoWindowVisible: boolean;
  destroy: () => void;
  updatePosition: (location: PingLocation) => void;
  showInfoWindow: () => void;
  hideInfoWindow: () => void;
  updateData: (newData: Partial<PingData>) => void;
}
