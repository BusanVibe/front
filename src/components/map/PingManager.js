/**
 * 지도에서 Ping 컴포넌트들을 관리하는 JavaScript 유틸리티
 * mapTemplate.js에서 사용됨
 */

/**
 * Ping 스타일 생성 함수
 */
function getPingStyle(props) {
  const { type, size = 'medium', color, icon, showPulse = false } = props;

  // 크기별 설정
  const sizeConfig = {
    small: { size: '1.2rem', iconSize: '0.7rem' },
    medium: { size: '1.8rem', iconSize: '1rem' },
    large: { size: '2.4rem', iconSize: '1.3rem' }
  };

  const currentSize = sizeConfig[size];

  // 타입별 기본 스타일
  let baseStyle = {};

  switch (type) {
    case 'current-location':
      baseStyle = {
        markerColor: color || '#4285F4',
        borderColor: '#ffffff',
        icon: icon || '📍',
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
    markerColor: baseStyle.markerColor,
    borderColor: baseStyle.borderColor,
    borderWidth: '0.2rem',
    icon: baseStyle.icon,
    pulseAnimation: baseStyle.pulseAnimation,
    shadowStyle: '0 0.2rem 0.4rem rgba(0,0,0,0.4)'
  };
}

/**
 * InfoWindow 내용 생성
 */
function createInfoWindowContent(props) {
  const { title, subtitle } = props;
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
}

/**
 * Ping 마커 HTML 생성
 */
function createPingMarkerHTML(props) {
  const style = getPingStyle(props);
  const { customStyle } = props;
  const label = props.title || '';

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
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
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
      .ping-label-${props.id} {
        margin-top: 6px;
        background: #ffffff;
        color: #333333;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        white-space: nowrap;
        border: 1px solid rgba(0,0,0,0.08);
        z-index: 3;
        pointer-events: none;
      }
    </style>
    <div class="ping-container-${props.id}" ${customStyle ? `style="${customStyle}"` : ''}>
      ${style.pulseAnimation !== 'none' ? `<div class="ping-pulse-${props.id}"></div>` : ''}
      <div class="ping-marker-${props.id}">
        ${style.icon}
      </div>
      ${label ? `<div class="ping-label-${props.id}">${label}</div>` : ''}
    </div>
  `;
}

/**
 * Ping 매니저 클래스
 */
class PingManager {
  constructor(map) {
    this.map = map;
    this.pings = new Map(); // id -> PingInstance
  }

  /**
   * 새로운 Ping 추가
   */
  addPing(pingData) {
    const { id, location, showInfoWindow = false, autoHideInfo = 0, onClick } = pingData;

    // 기존 Ping이 있으면 제거
    if (this.pings.has(id)) {
      this.removePing(id);
    }

    // 마커 생성
    const markerHTML = createPingMarkerHTML(pingData);
    // yAnchor를 마커 중심에 맞추도록 계산 (라벨 포함 높이 고려)
    const sizeMap = { small: 14, medium: 18, large: 24 };
    const markerPx = sizeMap[pingData.size || 'small'] || 14;
    const gapPx = 6; const labelH = 18; const totalH = markerPx + gapPx + labelH;
    const yAnchorVal = (markerPx / 2) / totalH;

    const customOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(location.latitude, location.longitude),
      content: markerHTML,
      yAnchor: yAnchorVal,
      xAnchor: 0.5,
      zIndex: pingData.zIndex || 100
    });

    // InfoWindow 생성 (필요한 경우)
    let infoOverlay = null;
    if (showInfoWindow) {
      const infoContent = createInfoWindowContent(pingData);
      infoOverlay = new kakao.maps.CustomOverlay({
        content: infoContent,
        position: new kakao.maps.LatLng(location.latitude, location.longitude),
        yAnchor: 1,
        zIndex: (pingData.zIndex || 100) + 10
      });
    }

    // 클릭 이벤트 설정
    const overlayElement = customOverlay.getContent();
    let actualElement = overlayElement;
    
    if (typeof overlayElement === 'string') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = overlayElement;
      actualElement = tempDiv.firstChild;
      customOverlay.setContent(actualElement);
    }

    if (actualElement && actualElement.addEventListener) {
      actualElement.addEventListener('click', () => {
        console.log(`Ping 클릭: ${id}`);
        
        // InfoWindow 토글
        if (infoOverlay) {
          const isVisible = infoOverlay.getMap() !== null;
          if (isVisible) {
            this.hideInfoWindow(id);
          } else {
            this.showInfoWindow(id);
          }
        }

        // 커스텀 클릭 핸들러 실행
        if (onClick) {
          onClick();
        }

        // RN으로 장소 클릭 이벤트 전달 (현재 위치 제외)
        try {
          if (typeof window !== 'undefined' && window.ReactNativeWebView && pingData.type !== 'current-location') {
            const guessedId = (typeof pingData.placeId !== 'undefined') ? pingData.placeId : (String(id || '').startsWith('poi-') ? Number(String(id).replace('poi-','')) : undefined);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'poiClicked',
              placeId: guessedId,
              id: id,
              name: pingData.title,
              latitude: location.latitude,
              longitude: location.longitude
            }));
          }
        } catch (e) {}
      });
    }

    // PingInstance 생성
    const pingInstance = {
      id,
      data: pingData,
      marker: customOverlay,
      infoWindow: infoOverlay,
      isInfoWindowVisible: false,
      
      destroy: () => {
        if (customOverlay) customOverlay.setMap(null);
        if (infoOverlay) infoOverlay.setMap(null);
      },
      
      updatePosition: (newLocation) => {
        const newPos = new kakao.maps.LatLng(newLocation.latitude, newLocation.longitude);
        if (customOverlay) customOverlay.setPosition(newPos);
        if (infoOverlay) infoOverlay.setPosition(newPos);
      },
      
      showInfoWindow: () => {
        if (infoOverlay && !pingInstance.isInfoWindowVisible) {
          infoOverlay.setMap(this.map);
          pingInstance.isInfoWindowVisible = true;
          
          // 자동 숨김 설정
          if (autoHideInfo > 0) {
            setTimeout(() => {
              this.hideInfoWindow(id);
            }, autoHideInfo);
          }
        }
      },
      
      hideInfoWindow: () => {
        if (infoOverlay && pingInstance.isInfoWindowVisible) {
          infoOverlay.setMap(null);
          pingInstance.isInfoWindowVisible = false;
        }
      },
      
      updateData: (newData) => {
        // 데이터 업데이트 시 마커를 다시 생성
        Object.assign(pingInstance.data, newData);
        this.addPing(pingInstance.data); // 재생성
      }
    };

    // 지도에 표시
    customOverlay.setMap(this.map);
    
    // 초기 InfoWindow 표시
    if (showInfoWindow && infoOverlay) {
      pingInstance.showInfoWindow();
    }

    // 저장
    this.pings.set(id, pingInstance);
    
    console.log(`Ping 추가 완료: ${id} (${pingData.type})`);
    return pingInstance;
  }

  /**
   * Ping 제거
   */
  removePing(id) {
    const ping = this.pings.get(id);
    if (ping) {
      ping.destroy();
      this.pings.delete(id);
      console.log(`Ping 제거 완료: ${id}`);
    }
  }

  /**
   * 모든 Ping 제거
   */
  removeAllPings() {
    this.pings.forEach((ping) => {
      ping.destroy();
    });
    this.pings.clear();
    console.log('모든 Ping 제거 완료');
  }

  /**
   * 특정 타입의 Ping들 제거
   */
  removePingsByType(type) {
    const toRemove = [];
    this.pings.forEach((ping, id) => {
      if (ping.data.type === type) {
        toRemove.push(id);
      }
    });
    
    toRemove.forEach(id => {
      this.removePing(id);
    });
    
    console.log(`${type} 타입 Ping ${toRemove.length}개 제거 완료`);
  }

  /**
   * Ping 가져오기
   */
  getPing(id) {
    return this.pings.get(id);
  }

  /**
   * 모든 Ping 가져오기
   */
  getAllPings() {
    return Array.from(this.pings.values());
  }

  /**
   * InfoWindow 표시
   */
  showInfoWindow(id) {
    const ping = this.pings.get(id);
    if (ping) {
      ping.showInfoWindow();
    }
  }

  /**
   * InfoWindow 숨기기
   */
  hideInfoWindow(id) {
    const ping = this.pings.get(id);
    if (ping) {
      ping.hideInfoWindow();
    }
  }

  /**
   * 현재 위치 Ping 업데이트 (편의 메서드)
   */
  updateCurrentLocationPing(location, showInfo = true) {
    const currentLocationPing = {
      id: 'current-location',
      location: location,
      type: 'current-location',
      title: '현재 위치',
      size: 'medium',
      showPulse: true,
      showInfoWindow: showInfo,
      autoHideInfo: showInfo ? 7000 : 0
    };
    
    return this.addPing(currentLocationPing);
  }

  /**
   * 현재 위치 Ping 숨기기 (편의 메서드)
   */
  hideCurrentLocationPing() {
    this.removePing('current-location');
  }
}

// 전역으로 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
  window.PingManager = PingManager;
  window.createPingMarkerHTML = createPingMarkerHTML;
  window.createInfoWindowContent = createInfoWindowContent;
  window.getPingStyle = getPingStyle;
}
