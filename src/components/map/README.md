# Ping 컴포넌트 사용 가이드

지도에서 위치를 표시하는 재사용 가능한 Ping 컴포넌트입니다.

## 주요 특징

- ✅ **재사용성**: 다양한 용도로 활용 가능한 범용 컴포넌트
- ✅ **타입 안전성**: TypeScript로 타입 정의
- ✅ **다양한 스타일**: 5가지 기본 타입 + 커스터마이징 지원
- ✅ **애니메이션**: 펄스 효과로 시각적 강조
- ✅ **InfoWindow**: 자동 표시/숨김 기능
- ✅ **이벤트 처리**: 클릭 이벤트 및 커스텀 핸들러 지원

## 기본 사용법

### 1. 현재 위치 Ping

```javascript
// 현재 위치 표시 (펄스 효과 + 자동 InfoWindow)
window.pingManager.updateCurrentLocationPing({
  latitude: 35.1796,
  longitude: 129.0756
}, true);
```

### 2. 검색 결과 Ping

```javascript
const searchResultPing = {
  id: 'search-busan-tower',
  location: { latitude: 35.1796, longitude: 129.0756 },
  type: 'search-result',
  title: '부산타워',
  subtitle: '부산의 대표 관광명소',
  size: 'large',
  showPulse: true,
  showInfoWindow: true,
  autoHideInfo: 5000
};

window.pingManager.addPing(searchResultPing);
```

### 3. POI (관심장소) Ping

```javascript
const poiPing = {
  id: 'poi-restaurant-1',
  location: { latitude: 35.1587, longitude: 129.1603 },
  type: 'poi',
  title: '해운대 맛집',
  subtitle: '신선한 해산물 요리',
  size: 'medium',
  color: '#EA4335',
  showInfoWindow: false
};

window.pingManager.addPing(poiPing);
```

### 4. 사용자 마커

```javascript
const userMarkerPing = {
  id: 'user-marker-1',
  location: { latitude: 35.1040, longitude: 129.0403 },
  type: 'user-marker',
  title: '내가 저장한 장소',
  icon: '⭐',
  size: 'small',
  onClick: () => {
    console.log('사용자 마커 클릭됨');
  }
};

window.pingManager.addPing(userMarkerPing);
```

### 5. 커스텀 Ping

```javascript
const customPing = {
  id: 'custom-ping-1',
  location: { latitude: 35.1796, longitude: 129.0756 },
  type: 'custom',
  title: '특별한 장소',
  color: '#9C27B0',
  icon: '🎯',
  size: 'large',
  showPulse: true,
  customStyle: 'filter: drop-shadow(0 0 10px rgba(156, 39, 176, 0.8));'
};

window.pingManager.addPing(customPing);
```

## Ping 타입

| 타입 | 기본 색상 | 기본 아이콘 | 용도 |
|------|-----------|-------------|------|
| `current-location` | `#4285F4` (파란색) | 📍 | 현재 위치 표시 |
| `search-result` | `#34A853` (초록색) | 🔍 | 검색 결과 |
| `poi` | `#EA4335` (빨간색) | 📍 | 관심 장소 |
| `user-marker` | `#FBBC05` (노란색) | 👤 | 사용자 저장 장소 |
| `custom` | `#9AA0A6` (회색) | 📍 | 커스텀 용도 |

## 크기 옵션

| 크기 | 값 | 픽셀 크기 |
|------|-----|-----------|
| `small` | `'small'` | 1.2rem |
| `medium` | `'medium'` | 1.8rem (기본값) |
| `large` | `'large'` | 2.4rem |

## PingManager 메서드

### 기본 메서드

```javascript
// Ping 추가
window.pingManager.addPing(pingData);

// Ping 제거
window.pingManager.removePing('ping-id');

// 모든 Ping 제거
window.pingManager.removeAllPings();

// 특정 타입 Ping들 제거
window.pingManager.removePingsByType('search-result');

// InfoWindow 표시/숨김
window.pingManager.showInfoWindow('ping-id');
window.pingManager.hideInfoWindow('ping-id');
```

### 편의 메서드

```javascript
// 현재 위치 Ping 업데이트
window.pingManager.updateCurrentLocationPing(location, showInfo);

// 현재 위치 Ping 숨기기
window.pingManager.hideCurrentLocationPing();
```

## React Native 연동 예시

```typescript
// CongestionScreen.tsx에서 사용
const showSearchResult = (latitude: number, longitude: number, placeName: string) => {
  if (webViewRef.current) {
    const pingData = {
      id: `search-${Date.now()}`,
      location: { latitude, longitude },
      type: 'search-result',
      title: placeName,
      subtitle: '검색 결과',
      showInfoWindow: true,
      autoHideInfo: 3000
    };
    
    webViewRef.current.postMessage(JSON.stringify({
      type: 'addPing',
      ping: pingData
    }));
  }
};
```

## 주의사항

1. **고유 ID**: 각 Ping은 고유한 ID를 가져야 합니다.
2. **메모리 관리**: 불필요한 Ping은 `removePing()`으로 제거하세요.
3. **성능**: 한 번에 너무 많은 Ping을 표시하면 성능에 영향을 줄 수 있습니다.
4. **좌표 유효성**: latitude/longitude 값이 유효한지 확인하세요.

## 확장 가능성

- 새로운 Ping 타입 추가
- 커스텀 애니메이션 효과
- 클러스터링 기능
- 데이터 바인딩 자동화

