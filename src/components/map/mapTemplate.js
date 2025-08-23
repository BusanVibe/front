// 카카오 지도 HTML 템플릿 생성 함수
export const createMapHTML = (config) => {
    const {
        centerLat,
        centerLng,
        currentLocation,
        shouldShowCurrentLocation,
        placeMarkers
    } = config;

    const isCurrentLocation = shouldShowCurrentLocation && !!currentLocation;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>카카오 지도</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=0578d9aa78d051f1c0efa91fe3c2cb6d"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            margin: 0; 
            padding: 0;
            /* 매끄러운 렌더링을 위한 최적화 */
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform;
        }
        
        #map { 
            width: 100%; 
            height: 100vh;
            /* 지도 컨테이너 렌더링 최적화 */
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform, opacity;
            /* 매끄러운 터치 및 드래그를 위한 설정 */
            touch-action: pan-x pan-y;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        .loading { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            background: white; 
            padding: 10px; 
            border-radius: 5px; 
            font-size: 14px; 
            z-index: 1000;
            /* 로딩 화면 최적화 */
            will-change: opacity;
            transition: opacity 0.3s ease;
        }
        
        /* 마커 및 인포윈도우 렌더링 최적화 */
        .custom-overlay {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: transform, opacity;
            transition: opacity 0.2s ease;
        }
    </style>
</head>
<body>
    <div id="map">
        <div class="loading" id="loadingMessage">${isCurrentLocation ? '현재 위치 지도 로딩 중...' : '지도 로딩 중...'}</div>
    </div>
    <script>
        // PingManager 클래스 정의
        class PingManager {
          constructor(map) {
            this.map = map;
            this.pings = new Map();
          }

          getPingStyle(props) {
            const { type, size = 'medium', color, icon, showPulse = false } = props;
            
            const sizeConfig = {
              small: { size: '0.8rem' },
              medium: { size: '1.2rem' },
              large: { size: '1.6rem' }
            };
            
            const currentSize = sizeConfig[size];
            let baseStyle = {};
            
            switch (type) {
              case 'current-location':
                baseStyle = {
                  markerColor: color || '#4285F4',
                  borderColor: '#ffffff',
                  icon: icon || '', // 현재 위치는 아이콘 없음
                  pulseAnimation: showPulse ? 'ping-pulse-blue' : 'none'
                };
                break;
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

          createInfoWindowContent(props) {
            const { title, subtitle } = props;
            const style = this.getPingStyle(props);
            
            return \`
              <div style="
                padding: 0.8rem 1.2rem;
                font-size: 0.9rem;
                text-align: center;
                background: white;
                border: 0.15rem solid \${style.markerColor};
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
                  color: \${style.markerColor};
                  margin-bottom: \${subtitle ? '0.3rem' : '0'};
                ">
                  \${style.icon} \${title}
                </div>
                \${subtitle ? \`
                  <div style="
                    font-size: 0.75rem;
                    color: #666;
                    line-height: 1.2;
                  ">
                    \${subtitle}
                  </div>
                \` : ''}
                <div style="
                  position: absolute;
                  bottom: -0.5rem;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 0.5rem solid transparent;
                  border-right: 0.5rem solid transparent;
                  border-top: 0.5rem solid \${style.markerColor};
                "></div>
              </div>
            \`;
          }

          createPingMarkerHTML(props) {
            if (props.type === 'current-location') {
              const idSafe = String(props.id || 'current-location').replace(/[^a-zA-Z0-9_-]/g, '');
              const core = 18;         // 파란 점 내부 지름(px)
              const border = 3;        // 흰 테두리(px)
              const color = '#4285F4';
              // 단일 엘리먼트(파란 점)만 사용하고 box-shadow 확장 애니메이션으로 웨이브 표현 → 중심 완전 일치
              return (
                '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:0;height:0;pointer-events:auto;">' +
                  '<style>' +
                    '@keyframes bvibe-ripple-' + idSafe + ' {' +
                      // 중심 고정, 그림자 반경만 확장해서 파동 표현
                      '0%{box-shadow:0 0 0 0 rgba(66,133,244,0.35);}' +
                      '70%{box-shadow:0 0 0 22px rgba(66,133,244,0);}' +
                      '100%{box-shadow:0 0 0 26px rgba(66,133,244,0);}' +
                    '}' +
                    '.cl-' + idSafe + ' {' +
                      'position:absolute;left:0;top:0;transform:translate(-50%,-50%);' +
                      'width:' + core + 'px;height:' + core + 'px;background:' + color + ';' +
                      'border:' + border + 'px solid #ffffff;border-radius:50%;' +
                      // 기본 드롭쉐도 + 리플 애니메이션 동시 적용
                      'box-shadow:0 2px 4px rgba(0,0,0,0.3);' +
                      'animation:bvibe-ripple-' + idSafe + ' 1.8s ease-out infinite;' +
                    '}' +
                  '</style>' +
                  '<div class="cl-' + idSafe + '"></div>' +
                '</div>'
              );
            }

            // POI: 간단 점 (중앙 정렬을 위해 0x0 래퍼 + translate)
            const sizePx = 14;
            const borderPx = 2;
            const color = props.color || '#9AA0A6';
            return '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:0;height:0;pointer-events:auto;">' +
              '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);' +
              'width:' + sizePx + 'px;height:' + sizePx + 'px;background:' + color + ';border:' + borderPx + 'px solid #ffffff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>' +
            '</div>';
          }

          addPing(pingData) {
            const { id, location, showInfoWindow = false, autoHideInfo = 0, onClick } = pingData;
            
            console.log('핑 추가 시작:', id, location);
            
            if (this.pings.has(id)) {
              this.removePing(id);
            }
            
            const markerHTML = this.createPingMarkerHTML(pingData);
            console.log('마커 HTML 생성 완료:', markerHTML.length, '글자');
            
            const customOverlay = new kakao.maps.CustomOverlay({
              position: new kakao.maps.LatLng(location.latitude, location.longitude),
              content: markerHTML,
              yAnchor: 0.5,
              xAnchor: 0.5,
              zIndex: pingData.zIndex || 100
            });
            
            console.log('CustomOverlay 생성 완료');
            
            const infoContent = this.createInfoWindowContent(pingData);
            let infoOverlay = new kakao.maps.CustomOverlay({
              content: infoContent,
              position: new kakao.maps.LatLng(location.latitude, location.longitude),
              yAnchor: 1,
              zIndex: (pingData.zIndex || 100) + 10
            });
            
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
              
              showInfoWindow: () => {
                if (infoOverlay && !pingInstance.isInfoWindowVisible) {
                  infoOverlay.setMap(this.map);
                  pingInstance.isInfoWindowVisible = true;
                  
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
              }
            };
            
            console.log('지도에 핑 표시 중...', 'Map 객체:', !!this.map);
            customOverlay.setMap(this.map);
            console.log('핑 지도 표시 완료:', id);
            
            // 초기에는 표시 옵션에 따라만 보여줌
            if (showInfoWindow && infoOverlay) pingInstance.showInfoWindow();
            
            this.pings.set(id, pingInstance);
            console.log(\`Ping 추가 완료: \${id} (\${pingData.type})\`);
            // 마커 클릭 시 현재 인포윈도우 토글
            try {
              var overlayElement = customOverlay.getContent();
              if (typeof overlayElement === 'string') {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = overlayElement;
                overlayElement = tempDiv.firstChild;
                customOverlay.setContent(overlayElement);
              }
              overlayElement.addEventListener('click', () => {
                if (pingInstance.isInfoWindowVisible) {
                  pingInstance.hideInfoWindow();
                } else {
                  pingInstance.showInfoWindow();
                }
              });
            } catch (e) {
              console.warn('현재위치 마커 클릭 핸들러 설정 실패', e);
            }

            // 지도 다른 영역 클릭 시 인포윈도우 닫기
            try {
              kakao.maps.event.addListener(this.map, 'click', () => {
                pingInstance.hideInfoWindow();
              });
            } catch (e) {
              console.warn('지도 클릭 핸들러 설정 실패', e);
            }

            return pingInstance;
          }

          removePing(id) {
            const ping = this.pings.get(id);
            if (ping) {
              ping.destroy();
              this.pings.delete(id);
              console.log(\`Ping 제거 완료: \${id}\`);
            }
          }

          hideInfoWindow(id) {
            const ping = this.pings.get(id);
            if (ping) {
              ping.hideInfoWindow();
            }
          }

          updateCurrentLocationPing(location, showInfo = false) {
            const currentLocationPing = {
              id: 'current-location',
              location: location,
              type: 'current-location',
              title: '현재 위치',
              size: 'large',
              showPulse: true,
              showInfoWindow: showInfo,
              autoHideInfo: 0,
              zIndex: 2000
            };
            
            return this.addPing(currentLocationPing);
          }

          hideCurrentLocationPing() {
            this.removePing('current-location');
          }

          // POI 타입 핑들 제거 (API 응답용)
          removePoiPings() {
            this.removePingsByType('poi');
          }

          // API 응답 데이터를 핑으로 변환
          addPlacePingsFromApiResponse(places) {
            console.log('API 응답 장소들을 핑으로 변환 시작:', places.length);
            
            // 기존 POI 핑들 제거
            this.removePoiPings();
            
            places.forEach((place, index) => {
              const lat = parseFloat(place.latitude);
              const lng = parseFloat(place.longitude);
              
              console.log(\`장소 \${index + 1}: \${place.name}\`);
              console.log('  - 좌표:', lat, lng);
              console.log('  - 혼잡도:', place.congestion_level);
              console.log('  - 타입:', place.type);
              
              if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                const pingData = {
                  id: \`poi-\${place.id}\`,
                  location: { latitude: lat, longitude: lng },
                  type: 'poi',
                  title: place.name,
                  subtitle: \`\${this.getCongestionText(place.congestion_level)} · \${place.type}\`,
                  size: 'small',
                  color: this.getCongestionColor(place.congestion_level),
                  icon: this.getPlaceTypeIcon(place.type),
                  showInfoWindow: false,
                  onClick: () => {
                    console.log('장소 핑 클릭:', place.name);
                  }
                };
                
                console.log('생성된 pingData:', pingData);
                this.addPing(pingData);
                console.log('장소 핑 추가 완료:', place.name);
              } else {
                console.log('유효하지 않은 좌표로 건너뜀:', lat, lng);
              }
            });
            
            console.log('API 응답 장소 핑 변환 완료');
          }

          // 혼잡도 레벨에 따른 색상
          getCongestionColor(level) {
            if (level >= 4) return '#ff4444'; // 매우 혼잡 - 빨간색
            if (level >= 3) return '#ff8800'; // 혼잡 - 주황색
            if (level >= 2) return '#ffcc00'; // 보통 - 노란색
            return '#44ff44'; // 여유 - 초록색
          }

          // 혼잡도 레벨에 따른 텍스트
          getCongestionText(level) {
            if (level >= 4) return '매우혼잡';
            if (level >= 3) return '혼잡';
            if (level >= 2) return '보통';
            return '여유';
          }

          // 장소 타입에 따른 아이콘
          getPlaceTypeIcon(type) {
            switch(type) {
              case 'SIGHT': return '🏛️';
              case 'RESTAURANT': return '🍽️';
              case 'CAFE': return '☕';
              case 'CONVSTORE': return '🏪';
              case 'CULTURE': return '🎭';
              case 'ALL': return '🌐';
              default: return '📍';
            }
          }

          // 특정 타입의 핑들 제거
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
            
            console.log(\`\${type} 타입 핑 \${toRemove.length}개 제거 완료\`);
          }
        }

        console.log('지도 초기화 시작 - 중심: ${centerLat}, ${centerLng}');
        
        function initMap() {
            try {
                if (typeof kakao === 'undefined') {
                    console.error('카카오 지도 API 로드 실패');
                    setTimeout(initMap, 1000);
                    return;
                }
                
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
                    level: 5, // 기본 줌 레벨 (1=가장넓음 ~ 14=가장세밀함)
                    draggable: true,
                    scrollwheel: true,
                    disableDoubleClick: false,
                    disableDoubleClickZoom: false,
                    minLevel: 1, // 최소 줌 레벨 (가장 넓게 볼 수 있는 범위)
                    maxLevel: 12 // 최대 줌 레벨 (너무 세밀하면 성능 이슈)
                };
                
                var map = new kakao.maps.Map(container, options);
                window.kakaoMap = map; // 전역 변수로 저장
                window.apiMarkers = []; // API 마커들을 저장할 배열
                window.isUpdatingMarkers = false; // 마커 업데이트 상태 초기화
                window.lastMapCenter = map.getCenter(); // 현재 지도 중심 저장
                
                // Ping 매니저 초기화
                console.log('🎯 PingManager 초기화 시작');
                window.pingManager = new PingManager(map);
                console.log('🎯 PingManager 초기화 완료:', !!window.pingManager);
                
                // 매끄러운 렌더링을 위한 성능 최적화
                if (map.getProjection) {
                    console.log('지도 투영 설정 활성화');
                }
                
                console.log('지도 생성 및 최적화 설정 완료');
                
                // 로딩 메시지 제거
                var loading = document.getElementById('loadingMessage');
                if (loading) {
                    loading.remove();
                }
                
                // 현재 위치 Ping 표시 (조건부)
                ${isCurrentLocation && currentLocation ? `
                window.pingManager.updateCurrentLocationPing({
                    latitude: ${currentLocation.latitude},
                    longitude: ${currentLocation.longitude}
                }, true);
                console.log('현재 위치 Ping 생성 완료');
                ` : ''}
                
                // API에서 받은 장소 마커들 표시
                var apiPlaces = ${JSON.stringify(placeMarkers)};
                console.log('API 장소 마커 개수:', apiPlaces.length);
                
                if (apiPlaces.length > 0) {
                    apiPlaces.forEach(function(place, index) {
                        // 좌표 유효성 검사
                        var lat = parseFloat(place.latitude);
                        var lng = parseFloat(place.longitude);
                        
                        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                            // 혼잡도에 따른 마커 색상
                            var congestionColor = getCongestionColor(place.congestion_level);
                            
                            // 커스텀 마커 생성
                            var markerContent = '<div style="' +
                                'width: 1.8rem; height: 1.8rem; ' +
                                'background-color: ' + congestionColor + '; ' +
                                'border: 0.2rem solid white; ' +
                                'border-radius: 50%; ' +
                                'box-shadow: 0 0.2rem 0.4rem rgba(0,0,0,0.4);' +
                                'cursor: pointer;' +
                                '"></div>';
                            
                            var customOverlay = new kakao.maps.CustomOverlay({
                                position: new kakao.maps.LatLng(lat, lng),
                                content: markerContent,
                                yAnchor: 0.5,
                                xAnchor: 0.5
                            });
                            customOverlay.setMap(map);
                            window.apiMarkers.push(customOverlay);
                            
                            // 커스텀 인포윈도우 생성 (기본 테두리 제거)
                            var congestionText = getCongestionText(place.congestion_level);
                            
                            var infoContent = '<div style="' +
                                'padding:0.8rem;' +
                                'font-size:0.9rem;' +
                                'text-align:center;' +
                                'min-width:10rem;' +
                                'max-width:15rem;' +
                                'background:white;' +
                                'border-radius:0.6rem;' +
                                'box-shadow:0 0.15rem 0.6rem rgba(0,0,0,0.15);' +
                                'border:none;' +
                                'position:relative;' +
                                'transform:translateY(-100%);' +
                                'margin-bottom:1rem;' +
                                '">' +
                                '<strong style="color:#333;font-size:1rem;">' + place.name + '</strong><br>' +
                                '<span style="color:' + congestionColor + ';font-weight:bold;font-size:0.85rem;margin:0.2rem 0;display:inline-block;">' + congestionText + '</span><br>' +
                                '<span style="color:#666;font-size:0.75rem;">' + place.type + '</span>' +
                                // 말풍선 꼬리 추가
                                '<div style="' +
                                'position:absolute;' +
                                'bottom:-0.5rem;' +
                                'left:50%;' +
                                'transform:translateX(-50%);' +
                                'width:0;' +
                                'height:0;' +
                                'border-left:0.5rem solid transparent;' +
                                'border-right:0.5rem solid transparent;' +
                                'border-top:0.5rem solid white;' +
                                '"></div>' +
                                '</div>';
                            
                            var infoOverlay = new kakao.maps.CustomOverlay({
                                content: infoContent,
                                position: new kakao.maps.LatLng(lat, lng),
                                yAnchor: 1,
                                zIndex: 1000
                            });
                            
                            // 마커 클릭 이벤트
                            (function(overlay, info, placeName) {
                                var overlayElement = overlay.getContent();
                                if (typeof overlayElement === 'string') {
                                    var tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = overlayElement;
                                    overlayElement = tempDiv.firstChild;
                                    overlay.setContent(overlayElement);
                                }
                                
                                overlayElement.addEventListener('click', function() {
                                    console.log('마커 클릭:', placeName);
                                    info.setMap(map);
                                    
                                    // 3초 후 인포윈도우 자동 닫기
                                    setTimeout(function() {
                                        info.setMap(null);
                                    }, 3000);
                                });
                            })(customOverlay, infoOverlay, place.name);
                            
                            console.log('마커 생성 완료:', place.name, 'at', lat, lng);
                        } else {
                            console.warn('유효하지 않은 좌표:', place.name, 'lat:', lat, 'lng:', lng);
                        }
                    });
                    console.log('API 장소 마커들 생성 완료');
                } else {
                    console.log('표시할 장소가 없습니다');
                }
                
                // 지도 드래그 시작 이벤트
                window.dragStartCenter = null;
                kakao.maps.event.addListener(map, 'dragstart', function() {
                    console.log('지도 드래그 시작');
                    window.dragStartCenter = map.getCenter();
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'dragStart'
                        }));
                    }
                });
                
                                // 지도 드래그 완료 이벤트
                kakao.maps.event.addListener(map, 'dragend', function() {
                    // 마커 업데이트 중에는 드래그 이벤트 무시
                    if (window.isUpdatingMarkers) {
                        console.log('마커 업데이트 중이므로 드래그 이벤트 무시');
                        return;
                    }
                    
                    var center = map.getCenter();
                    var lat = center.getLat();
                    var lng = center.getLng();
                    
                    // 현재 지도 중심 업데이트
                    window.lastMapCenter = center;
                    
                    // 드래그 거리 계산 (최소 드래그 거리 확인)
                    var dragDistance = 0;
                    if (window.dragStartCenter) {
                        var startLat = window.dragStartCenter.getLat();
                        var startLng = window.dragStartCenter.getLng();
                        dragDistance = Math.sqrt(Math.pow(lat - startLat, 2) + Math.pow(lng - startLng, 2));
                    }
                    
                    console.log('지도 드래그 완료:', lat, lng, '드래그 거리:', dragDistance.toFixed(6));
                    
                    // 최소 드래그 거리 이상일 때만 API 호출 (의도치 않은 미세한 이동 방지)
                    if (dragDistance > 0.001) {
                        var currentZoomLevel = map.getLevel();
                        console.log('현재 줌 레벨:', currentZoomLevel);
                        
                                                 // 줌 레벨이 7 이상일 때(더 세밀할 때)는 API 호출하지 않음
                         if (currentZoomLevel >= 7) {
                             console.log('줌 레벨이 7 이상이어서 API 호출을 생략합니다 (현재:', currentZoomLevel, ')');
                             return;
                         }
                        
                        // 현재 지도의 bounds 계산
                        var bounds = map.getBounds();
                        var sw = bounds.getSouthWest(); // 남서쪽 (좌하단)
                        var ne = bounds.getNorthEast(); // 북동쪽 (우상단)
                        
                        var boundsData = {
                            lat1: ne.getLat(), // 좌상단 위도 (북쪽)
                            lng1: sw.getLng(), // 좌상단 경도 (서쪽)
                            lat2: sw.getLat(), // 우하단 위도 (남쪽)
                            lng2: ne.getLng()  // 우하단 경도 (동쪽)
                        };
                        
                        console.log('지도 bounds 계산:', boundsData);
                        
                        // React Native로 bounds 전달
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'dragEnd',
                                latitude: lat,
                                longitude: lng,
                                dragDistance: dragDistance,
                                zoomLevel: currentZoomLevel,
                                bounds: boundsData
                            }));
                        }
                    } else {
                        console.log('드래그 거리가 너무 작아서 API 호출 생략');
                    }
                });
                
                // 줌 레벨 변경 시 디바운스 처리
                var zoomTimer = null;
                kakao.maps.event.addListener(map, 'zoom_changed', function() {
                    // 마커 업데이트 중에는 줌 이벤트 무시
                    if (window.isUpdatingMarkers) {
                        console.log('마커 업데이트 중이므로 줌 이벤트 무시');
                        return;
                    }
                    
                    // 기존 타이머 취소
                    if (zoomTimer) {
                        clearTimeout(zoomTimer);
                    }
                    
                    // 300ms 후에 이벤트 전송 (연속된 줌 변경을 방지)
                    zoomTimer = setTimeout(function() {
                        // 다시 한 번 마커 업데이트 중인지 확인
                        if (window.isUpdatingMarkers) {
                            console.log('타이머 실행 시점에 마커 업데이트 중이므로 줌 이벤트 무시');
                            return;
                        }
                        
                        var center = map.getCenter();
                        var lat = center.getLat();
                        var lng = center.getLng();
                        var level = map.getLevel();
                        
                        // 현재 지도 중심 업데이트
                        window.lastMapCenter = center;
                        
                        console.log('지도 줌 변경 완료:', lat, lng, '줌 레벨:', level);
                        
                        // 줌 레벨이 7 이상일 때(더 세밀할 때)는 API 호출하지 않음
                        if (level >= 7) {
                            console.log('줌 레벨이 7 이상이어서 API 호출을 생략합니다 (현재:', level, ')');
                            return;
                        }
                        
                        // 현재 지도의 bounds 계산
                        var bounds = map.getBounds();
                        var sw = bounds.getSouthWest(); // 남서쪽 (좌하단)
                        var ne = bounds.getNorthEast(); // 북동쪽 (우상단)
                        
                        var boundsData = {
                            lat1: ne.getLat(), // 좌상단 위도 (북쪽)
                            lng1: sw.getLng(), // 좌상단 경도 (서쪽)
                            lat2: sw.getLat(), // 우하단 위도 (남쪽)
                            lng2: ne.getLng()  // 우하단 경도 (동쪽)
                        };
                        
                        console.log('줌 변경 - 지도 bounds 계산:', boundsData);
                        
                        // React Native로 bounds 전달
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'zoomChanged',
                                latitude: lat,
                                longitude: lng,
                                zoomLevel: level,
                                bounds: boundsData
                            }));
                        }
                    }, 300);
                });
                
                console.log('지도 초기화 완료');

            } catch (error) {
                console.error('지도 초기화 오류:', error);
                setTimeout(initMap, 2000);
            }
        }

        // 마커 업데이트 함수
        function updateMarkers(newMarkers) {
            console.log('마커 업데이트 시작:', newMarkers.length);
            
            // 현재 지도 상태 저장 (중심 좌표와 줌 레벨 보존)
            var currentCenter = window.kakaoMap.getCenter();
            var currentLevel = window.kakaoMap.getLevel();
            console.log('현재 지도 상태 저장 - 중심:', currentCenter.getLat(), currentCenter.getLng(), '줌:', currentLevel);
            
            // 지도 상태 고정 (마커 업데이트 중 변경 방지)
            window.isUpdatingMarkers = true;
            
            // 기존 API 마커들 제거
            if (window.apiMarkers) {
                window.apiMarkers.forEach(function(marker) {
                    marker.setMap(null);
                });
            }
            window.apiMarkers = [];

            // 새로운 마커들 추가
            if (newMarkers.length > 0) {
                newMarkers.forEach(function(place, index) {
                    var lat = parseFloat(place.latitude);
                    var lng = parseFloat(place.longitude);
                    
                    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                        var congestionColor = getCongestionColor(place.congestion_level);
                        
                        var markerContent = '<div style="' +
                            'width: 1.8rem; height: 1.8rem; ' +
                            'background-color: ' + congestionColor + '; ' +
                            'border: 0.2rem solid white; ' +
                            'border-radius: 50%; ' +
                            'box-shadow: 0 0.2rem 0.4rem rgba(0,0,0,0.4);' +
                            'cursor: pointer;' +
                            '"></div>';
                        
                        var customOverlay = new kakao.maps.CustomOverlay({
                            position: new kakao.maps.LatLng(lat, lng),
                            content: markerContent,
                            yAnchor: 0.5,
                            xAnchor: 0.5
                        });
                        customOverlay.setMap(window.kakaoMap);
                        
                        var congestionText = getCongestionText(place.congestion_level);
                        
                        var infoContent = '<div style="' +
                            'padding:0.8rem;' +
                            'font-size:0.9rem;' +
                            'text-align:center;' +
                            'min-width:10rem;' +
                            'max-width:15rem;' +
                            'background:white;' +
                            'border-radius:0.6rem;' +
                            'box-shadow:0 0.15rem 0.6rem rgba(0,0,0,0.15);' +
                            'border:none;' +
                            'position:relative;' +
                            'transform:translateY(-100%);' +
                            'margin-bottom:1rem;' +
                            '">' +
                            '<strong style="color:#333;font-size:1rem;">' + place.name + '</strong><br>' +
                            '<span style="color:' + congestionColor + ';font-weight:bold;font-size:0.85rem;margin:0.2rem 0;display:inline-block;">' + congestionText + '</span><br>' +
                            '<span style="color:#666;font-size:0.75rem;">' + place.type + '</span>' +
                            // 말풍선 꼬리 추가
                            '<div style="' +
                            'position:absolute;' +
                            'bottom:-0.5rem;' +
                            'left:50%;' +
                            'transform:translateX(-50%);' +
                            'width:0;' +
                            'height:0;' +
                            'border-left:0.5rem solid transparent;' +
                            'border-right:0.5rem solid transparent;' +
                            'border-top:0.5rem solid white;' +
                            '"></div>' +
                            '</div>';
                        
                        var infoOverlay = new kakao.maps.CustomOverlay({
                            content: infoContent,
                            position: new kakao.maps.LatLng(lat, lng),
                            yAnchor: 1,
                            zIndex: 1000
                        });
                        
                        (function(overlay, info, placeName) {
                            var overlayElement = overlay.getContent();
                            if (typeof overlayElement === 'string') {
                                var tempDiv = document.createElement('div');
                                tempDiv.innerHTML = overlayElement;
                                overlayElement = tempDiv.firstChild;
                                overlay.setContent(overlayElement);
                            }
                            
                            overlayElement.addEventListener('click', function() {
                                console.log('마커 클릭:', placeName);
                                info.setMap(window.kakaoMap);
                                
                                setTimeout(function() {
                                    info.setMap(null);
                                }, 3000);
                            });
                        })(customOverlay, infoOverlay, place.name);
                        
                        window.apiMarkers.push(customOverlay);
                        console.log('마커 업데이트 완료:', place.name);
                    }
                });
                console.log('모든 마커 업데이트 완료');
                
                // 지도 상태 복원 (사용자 줌 레벨 유지) - 더 빠르고 안정적으로
                // 즉시 복원 시도 (애니메이션 없이)
                if (window.kakaoMap) {
                    var newCenter = window.kakaoMap.getCenter();
                    var newLevel = window.kakaoMap.getLevel();
                    
                    // 중심 좌표 즉시 복원
                    if (Math.abs(newCenter.getLat() - currentCenter.getLat()) > 0.001 || 
                        Math.abs(newCenter.getLng() - currentCenter.getLng()) > 0.001) {
                        console.log('지도 중심 좌표 즉시 복원:', currentCenter.getLat(), currentCenter.getLng());
                        window.kakaoMap.panTo(currentCenter); // setCenter 대신 panTo 사용 (더 부드러움)
                    }
                    
                    // 줌 레벨 즉시 복원
                    if (newLevel !== currentLevel) {
                        console.log('사용자 줌 레벨 즉시 복원:', currentLevel);
                        window.kakaoMap.setLevel(currentLevel, {animate: false}); // 애니메이션 없이 즉시 변경
                    }
                }
                
                // 마커 업데이트 완료 표시
                window.isUpdatingMarkers = false;
            } else {
                console.log('표시할 마커가 없습니다');
            }
        }

        // React Native에서 메시지 수신 (window/document 모두 리스닝)
        function handleRNMessage(event) {
            console.log('🔵 WebView 메시지 수신:', event.data);
            try {
                var data = JSON.parse(event.data);
                console.log('🔵 파싱된 메시지 데이터:', data);
                
                if (data.type === 'updateMarkers') {
                    updateMarkers(data.markers);
                } else if (data.type === 'updatePlacePings') {
                    var len = (data.places && Array.isArray(data.places)) ? data.places.length : 0;
                    console.log('🎯 updatePlacePings 메시지 수신:', len, '개 장소');
                    if (window.pingManager && len > 0) {
                        window.pingManager.addPlacePingsFromApiResponse(data.places);
                    } else if (len === 0) {
                        console.log('ℹ️ 전달된 장소 없음 - 핑 업데이트 생략');
                        if (window.pingManager) {
                            window.pingManager.removePoiPings();
                        }
                    } else {
                        console.error('❌ PingManager 없음');
                    }
                } else if (data.type === 'moveToLocation') {
                    moveToLocation(data.latitude, data.longitude, data.showCurrentLocation);
                } else if (data.type === 'hideCurrentLocation') {
                    hideCurrentLocation();
                } else if (data.type === 'setCurrentLocationPing') {
                    if (window.pingManager && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                        window.pingManager.updateCurrentLocationPing({
                            latitude: data.latitude,
                            longitude: data.longitude
                        }, false);
                        console.log('현재 위치 Ping 업데이트(이동 없음) 완료');
                    }
                } else {
                    console.log('🔵 알 수 없는 메시지 타입:', data.type);
                }
            } catch (error) {
                console.error('❌ 메시지 파싱 오류:', error);
            }
        }
        window.addEventListener('message', handleRNMessage);
        if (document && document.addEventListener) {
            document.addEventListener('message', handleRNMessage);
        }

                 // 지도 중심 이동 함수
         function moveToLocation(latitude, longitude, showCurrentLocation) {
             console.log('지도 중심 이동:', latitude, longitude);
             
             if (window.kakaoMap) {
                 var moveLatLng = new kakao.maps.LatLng(latitude, longitude);
                 window.kakaoMap.setCenter(moveLatLng);
                 window.kakaoMap.setLevel(5); // 현재위치 버튼 클릭 시 기본 줌 레벨 5로 설정
                 console.log('줌 레벨을 5로 설정했습니다');
                 
                 // 현재 위치 Ping은 항상 업데이트 (팻말은 showCurrentLocation에 따라 제어)
                 if (window.pingManager) {
                     window.pingManager.updateCurrentLocationPing({
                         latitude: latitude,
                         longitude: longitude
                     }, false);
                     console.log('현재 위치 Ping 업데이트 완료(항상)');
                 }
                 
                 console.log('지도 중심 이동 완료');
             }
         }

         // 현재 위치 Ping 숨기기 함수
         function hideCurrentLocation() {
             console.log('현재 위치 Ping 숨기기');
             
             window.pingManager.hideCurrentLocationPing();
             
             console.log('현재 위치 Ping 숨기기 완료');
         }

        // 혼잡도 레벨에 따른 마커 색상 결정
        function getCongestionColor(level) {
            if (level >= 4) return '#ff4444'; // 매우 혼잡 - 빨간색
            if (level >= 3) return '#ff8800'; // 혼잡 - 주황색
            if (level >= 2) return '#ffcc00'; // 보통 - 노란색
            return '#44ff44'; // 여유 - 초록색
        }

        // 혼잡도 레벨에 따른 텍스트 결정
        function getCongestionText(level) {
            if (level >= 4) return '매우혼잡';
            if (level >= 3) return '혼잡';
            if (level >= 2) return '보통';
            return '여유';
        }

        // 지도 초기화 실행
        console.log('🚀 WebView 스크립트 시작, document.readyState:', document.readyState);
        
        if (document.readyState === 'loading') {
            console.log('🚀 DOMContentLoaded 이벤트 대기 중...');
            document.addEventListener('DOMContentLoaded', function() {
                console.log('🚀 DOMContentLoaded 이벤트 발생, 지도 초기화 시작');
                initMap();
            });
        } else {
            console.log('🚀 DOM 이미 로드됨, 즉시 지도 초기화');
            initMap();
        }
    </script>
</body>
</html>`;
};