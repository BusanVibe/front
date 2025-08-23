/**
 * 재사용 가능한 Ping 컴포넌트
 * 지도에서 위치를 표시하는 핑(마커) 요소를 생성
 */

import React from 'react';

export interface PingProps {
  id: string;
  type: 'current-location' | 'search-result' | 'poi' | 'user-marker' | 'custom';
  title: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  icon?: string;
  showPulse?: boolean;
  showInfoWindow?: boolean;
  autoHideInfo?: number; // 밀리초 단위, 0이면 자동 숨김 없음
  onClick?: () => void;
  customStyle?: string;
}

export interface PingStyle {
  markerSize: string;
  markerColor: string;
  borderColor: string;
  borderWidth: string;
  icon: string;
  pulseAnimation: string;
  shadowStyle: string;
}

/**
 * Ping 타입별 기본 스타일 설정
 */
export const getPingStyle = (props: PingProps): PingStyle => {
  const { type, size = 'medium', color, icon, showPulse = false } = props;

  // 크기별 설정
  const sizeConfig = {
    small: { size: '1.2rem', iconSize: '0.7rem' },
    medium: { size: '1.8rem', iconSize: '1rem' },
    large: { size: '2.4rem', iconSize: '1.3rem' }
  };

  const currentSize = sizeConfig[size];

  // 타입별 기본 스타일
  let baseStyle: Partial<PingStyle> = {};

  switch (type) {
                  case 'current-location':
      baseStyle = {
        markerColor: color || '#4285F4',
        borderColor: '#ffffff',
        icon: icon || '', // 현재 위치는 아이콘 없음
        pulseAnimation: showPulse ? 'ping-pulse-blue' : 'none'
      };
      break;
    case 'search-result':
      baseStyle = {
        markerColor: color || '#34A853',
        borderColor: '#ffffff',
        icon: icon || '🔍',
        pulseAnimation: showPulse ? 'ping-pulse-green' : 'none'
      };
      break;
    case 'poi':
      baseStyle = {
        markerColor: color || '#EA4335',
        borderColor: '#ffffff',
        icon: icon || '📍',
        pulseAnimation: showPulse ? 'ping-pulse-red' : 'none'
      };
      break;
    case 'user-marker':
      baseStyle = {
        markerColor: color || '#FBBC05',
        borderColor: '#ffffff',
        icon: icon || '👤',
        pulseAnimation: showPulse ? 'ping-pulse-yellow' : 'none'
      };
      break;
    case 'custom':
    default:
      baseStyle = {
        markerColor: color || '#9AA0A6',
        borderColor: '#ffffff',
        icon: icon || '📍',
        pulseAnimation: showPulse ? 'ping-pulse-gray' : 'none'
      };
      break;
  }

  return {
    markerSize: currentSize.size,
    markerColor: baseStyle.markerColor!,
    borderColor: baseStyle.borderColor!,
    borderWidth: '0.2rem',
    icon: baseStyle.icon!,
    pulseAnimation: baseStyle.pulseAnimation!,
    shadowStyle: '0 0.2rem 0.4rem rgba(0,0,0,0.4)'
  };
};

/**
 * InfoWindow 내용 생성
 */
export const createInfoWindowContent = (props: PingProps): string => {
  const { title, subtitle, type } = props;
  const style = getPingStyle(props);

  return `
    <div style="
      padding: 0.8rem 1.2rem;
      font-size: 0.9rem;
      text-align: center;
      background: white;
      border: 0.15rem solid ${style.markerColor};
      border-radius: 0.6rem;
      min-width: 8rem;
      max-width: 12rem;
      box-shadow: 0 0.15rem 0.6rem rgba(0,0,0,0.15);
      position: relative;
      transform: translateY(-100%);
      margin-bottom: 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        font-size: 1rem;
        font-weight: bold;
        color: ${style.markerColor};
        margin-bottom: ${subtitle ? '0.3rem' : '0'};
      ">
        ${style.icon} ${title}
      </div>
      ${subtitle ? `
        <div style="
          font-size: 0.75rem;
          color: #666;
          line-height: 1.2;
        ">
          ${subtitle}
        </div>
      ` : ''}
      <!-- 말풍선 꼬리 -->
      <div style="
        position: absolute;
        bottom: -0.5rem;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 0.5rem solid transparent;
        border-right: 0.5rem solid transparent;
        border-top: 0.5rem solid ${style.markerColor};
      "></div>
    </div>
  `;
};

/**
 * Ping 마커 HTML 생성
 */
export const createPingMarkerHTML = (props: PingProps): string => {
  const style = getPingStyle(props);
  const { customStyle } = props;

  const pulseKeyframes = `
    @keyframes ping-pulse-blue {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes ping-pulse-green {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes ping-pulse-red {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes ping-pulse-yellow {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes ping-pulse-gray {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  `;

  return `
    <style>
      ${pulseKeyframes}
      .ping-container-${props.id} {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ping-marker-${props.id} {
        width: ${style.markerSize};
        height: ${style.markerSize};
        background-color: ${style.markerColor};
        border: ${style.borderWidth} solid ${style.borderColor};
        border-radius: 50%;
        box-shadow: ${style.shadowStyle};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(${style.markerSize} * 0.5);
        position: relative;
        z-index: 2;
        transition: transform 0.2s ease;
      }
      .ping-marker-${props.id}:hover {
        transform: scale(1.1);
      }
      .ping-pulse-${props.id} {
        position: absolute;
        width: ${style.markerSize};
        height: ${style.markerSize};
        background-color: ${style.markerColor};
        border-radius: 50%;
        opacity: 0.6;
        animation: ${style.pulseAnimation} 2s infinite;
        z-index: 1;
      }
    </style>
    <div class="ping-container-${props.id}" ${customStyle ? `style="${customStyle}"` : ''}>
      ${style.pulseAnimation !== 'none' ? `<div class="ping-pulse-${props.id}"></div>` : ''}
      <div class="ping-marker-${props.id}">
        ${style.icon}
      </div>
    </div>
  `;
};

/**
 * React 컴포넌트 (문서화 및 타입 체크용)
 * 실제로는 HTML 문자열을 생성하는 함수들을 사용
 */
export const Ping: React.FC<PingProps> = (props) => {
  // 이 컴포넌트는 실제로 렌더링되지 않음
  // HTML 문자열 생성 함수들이 실제 사용됨
  return null;
};

export default Ping;
