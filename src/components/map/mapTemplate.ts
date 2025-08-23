// 카카오 지도 HTML 템플릿 생성 함수 (TypeScript)
export const createMapHTML = (config: {
    centerLat: number;
    centerLng: number;
    currentLocation?: { latitude: number; longitude: number } | null;
    shouldShowCurrentLocation?: boolean;
    placeMarkers: any[];
}) => {
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
              return (
                '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:0;height:0;pointer-events:auto;">' +
                  '<style>' +
                    '@keyframes bvibe-ripple-' + idSafe + ' {' +
                      '0%{box-shadow:0 0 0 0 rgba(66,133,244,0.35);}' +
                      '70%{box-shadow:0 0 0 22px rgba(66,133,244,0);}' +
                      '100%{box-shadow:0 0 0 26px rgba(66,133,244,0);}' +
                    '}' +
                    '.cl-' + idSafe + ' {' +
                      'position:absolute;left:0;top:0;transform:translate(-50%,-50%);' +
                      'width:' + core + 'px;height:' + core + 'px;background:' + color + ';' +
                      'border:' + border + 'px solid #ffffff;border-radius:50%;' +
                      'box-shadow:0 2px 4px rgba(0,0,0,0.3);' +
                      'animation:bvibe-ripple-' + idSafe + ' 1.8s ease-out infinite;' +
                    '}' +
                  '</style>' +
                  '<div class="cl-' + idSafe + '"></div>' +
                '</div>'
              );
            }

            // POI: 점 + 하단 라벨
            const sizePx = 18;
            const borderPx = 2;
            const color = props.color || '#9AA0A6';
            const label = props.title || '';
            const gapPx = 6;
            return '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;">' +
              '<div style="width:' + sizePx + 'px;height:' + sizePx + 'px;background:' + color + ';border:' + borderPx + 'px solid #ffffff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>' +
              (label ? '<div style="margin-top:' + gapPx + 'px;background:#ffffff;color:#333;font-size:12px;padding:2px 6px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap;border:1px solid rgba(0,0,0,0.08);">' + label + '</div>' : '') +
            '</div>';
          }

          addPing(pingData) {
            const { id, location, showInfoWindow = false, autoHideInfo = 0, onClick } = pingData;
            
            if (this.pings.has(id)) {
              this.removePing(id);
            }
            
            const markerHTML = this.createPingMarkerHTML(pingData);
            const sizeMap = { small: 14, medium: 18, large: 24 };
            const markerPx = sizeMap[pingData.size || 'small'] || 14;
            const gapPx = (pingData.type === 'current-location') ? 0 : 6;
            const labelH = (pingData.type === 'current-location') ? 0 : 18;
            const totalH = markerPx + gapPx + labelH;
            const yAnchorVal = (markerPx / 2) / totalH;
            const customOverlay = new kakao.maps.CustomOverlay({
              position: new kakao.maps.LatLng(location.latitude, location.longitude),
              content: markerHTML,
              yAnchor: yAnchorVal,
              xAnchor: 0.5,
              zIndex: pingData.zIndex || 100
            });
            
            // InfoOverlay는 현재위치 등 필요 케이스에만 생성 (POI는 생성하지 않음)
            let infoOverlay = null;
            if (pingData.type !== 'poi' && showInfoWindow) {
              const infoContent = this.createInfoWindowContent(pingData);
              infoOverlay = new kakao.maps.CustomOverlay({
                content: infoContent,
                position: new kakao.maps.LatLng(location.latitude, location.longitude),
                yAnchor: 1,
                zIndex: (pingData.zIndex || 100) + 10
              });
            }
            
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
            
            customOverlay.setMap(this.map);
            
            if (showInfoWindow && infoOverlay) pingInstance.showInfoWindow();
            
            this.pings.set(id, pingInstance);
            
            try {
              var overlayElement = customOverlay.getContent();
              if (typeof overlayElement === 'string') {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = overlayElement;
                overlayElement = tempDiv.firstChild;
                customOverlay.setContent(overlayElement);
              }
              overlayElement.addEventListener('click', () => {
                // POI는 말풍선 토글을 하지 않음
                if (pingData.type !== 'poi') {
                  if (pingInstance.isInfoWindowVisible) {
                    pingInstance.hideInfoWindow();
                  } else {
                    pingInstance.showInfoWindow();
                  }
                }
                // RN으로 장소 클릭 이벤트 전달 (현재 위치 제외)
                try {
                  if (window.ReactNativeWebView && pingData.type !== 'current-location') {
                    const placeId = (typeof pingData.placeId !== 'undefined') ? pingData.placeId : (String(pingData.id || '').startsWith('poi-') ? Number(String(pingData.id).replace('poi-','')) : undefined);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'poiClicked',
                      placeId: placeId,
                      id: pingData.id,
                      name: pingData.title,
                      latitude: location.latitude,
                      longitude: location.longitude
                    }));
                  }
                } catch (e) {}
              });
            } catch (e) {}

            try {
              if (pingData.type !== 'poi') {
                kakao.maps.event.addListener(this.map, 'click', () => {
                  pingInstance.hideInfoWindow();
                });
              }
            } catch (e) {}

            return pingInstance;
          }

          removePing(id) {
            const ping = this.pings.get(id);
            if (ping) {
              ping.destroy();
              this.pings.delete(id);
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
            this.removePoiPings();
            places.forEach((place, index) => {
              const lat = parseFloat(place.latitude);
              const lng = parseFloat(place.longitude);
              if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                const pingData = {
                  id: 'poi-' + place.id,
                  location: { latitude: lat, longitude: lng },
                  type: 'poi',
                  title: place.name,
                  subtitle: this.getCongestionText(place.congestion_level) + ' · ' + place.type,
                  size: 'small',
                  color: this.getCongestionColor(place.congestion_level),
                  icon: this.getPlaceTypeIcon(place.type),
                  showInfoWindow: false,
                  placeId: place.id
                };
                this.addPing(pingData);
              }
            });
          }

          getCongestionColor(level) {
            // CongestionBadge 배경색 팔레트와 동일하게 매핑
            // 4: 혼잡(red100), 3: 약간혼잡(orange100), 2: 보통(yellow100), 1: 여유(green100)
            if (level >= 4) return '#ECC3C3';
            if (level >= 3) return '#EDCFBA';
            if (level >= 2) return '#E8DDBA';
            return '#BDD8BA';
          }

          getCongestionText(level) {
            if (level >= 4) return '매우혼잡';
            if (level >= 3) return '혼잡';
            if (level >= 2) return '보통';
            return '여유';
          }

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

          removePingsByType(type) {
            const toRemove = [];
            this.pings.forEach((ping, id) => {
              if (ping.data.type === type) {
                toRemove.push(id);
              }
            });
            toRemove.forEach(id => { this.removePing(id); });
          }
        }

        function initMap() {
            try {
                if (typeof kakao === 'undefined') {
                    setTimeout(initMap, 1000);
                    return;
                }
                
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
                    level: 5,
                    draggable: true,
                    scrollwheel: true,
                    disableDoubleClick: false,
                    disableDoubleClickZoom: false,
                    minLevel: 1,
                    maxLevel: 12
                };
                
                var map = new kakao.maps.Map(container, options);
                window.kakaoMap = map;
                window.apiMarkers = [];
                window.isUpdatingMarkers = false;
                window.lastMapCenter = map.getCenter();
                
                window.pingManager = new PingManager(map);
                
                var loading = document.getElementById('loadingMessage');
                if (loading) { loading.remove(); }
                
                ${isCurrentLocation && currentLocation ? `
                window.pingManager.updateCurrentLocationPing({
                    latitude: ${currentLocation.latitude},
                    longitude: ${currentLocation.longitude}
                }, true);
                ` : ''}
                
                var apiPlaces = ${JSON.stringify(placeMarkers)};
                if (apiPlaces.length > 0) {
                    apiPlaces.forEach(function(place, index) {
                        var lat = parseFloat(place.latitude);
                        var lng = parseFloat(place.longitude);
                        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                            var congestionColor = getCongestionColor(place.congestion_level);
                            var label = place.name || '';
                            var sizePx = 18; var borderPx = 2; var gapPx = 6; var labelH = 18; var totalH = sizePx + gapPx + labelH; var yAnchorVal = (sizePx/2) / totalH;
                            var markerContent = '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;">' +
                                '<div style="width:' + sizePx + 'px;height:' + sizePx + 'px;background-color:' + congestionColor + ';border:' + borderPx + 'px solid #ffffff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>' +
                                (label ? '<div style="margin-top:' + gapPx + 'px;background:#ffffff;color:#333;font-size:12px;padding:2px 6px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap;border:1px solid rgba(0,0,0,0.08);">' + label + '</div>' : '') +
                            '</div>';
                            var customOverlay = new kakao.maps.CustomOverlay({
                                position: new kakao.maps.LatLng(lat, lng),
                                content: markerContent,
                                yAnchor: yAnchorVal,
                                xAnchor: 0.5
                            });
                            customOverlay.setMap(map);
                            window.apiMarkers.push(customOverlay);
                            
                            (function(overlay, placeObj) {
                                var overlayElement = overlay.getContent();
                                if (typeof overlayElement === 'string') {
                                    var tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = overlayElement;
                                    overlayElement = tempDiv.firstChild;
                                    overlay.setContent(overlayElement);
                                }
                                
                                overlayElement.addEventListener('click', function() {
                                    try {
                                      if (window.ReactNativeWebView) {
                                        window.ReactNativeWebView.postMessage(JSON.stringify({
                                          type: 'poiClicked',
                                          placeId: placeObj.id,
                                          id: 'poi-' + placeObj.id,
                                          name: placeObj.name,
                                          latitude: lat,
                                          longitude: lng
                                        }));
                                      }
                                    } catch (e) {}
                                });
                            })(customOverlay, place);
                        }
                    });
                }
                
                window.dragStartCenter = null;
                kakao.maps.event.addListener(map, 'dragstart', function() {
                    window.dragStartCenter = map.getCenter();
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dragStart' }));
                    }
                });
                
                kakao.maps.event.addListener(map, 'dragend', function() {
                    if (window.isUpdatingMarkers) { return; }
                    var center = map.getCenter();
                    var lat = center.getLat();
                    var lng = center.getLng();
                    window.lastMapCenter = center;
                    var dragDistance = 0;
                    if (window.dragStartCenter) {
                        var startLat = window.dragStartCenter.getLat();
                        var startLng = window.dragStartCenter.getLng();
                        dragDistance = Math.sqrt(Math.pow(lat - startLat, 2) + Math.pow(lng - startLng, 2));
                    }
                    if (dragDistance > 0.001) {
                        var currentZoomLevel = map.getLevel();
                        if (currentZoomLevel >= 7) { return; }
                        var bounds = map.getBounds();
                        var sw = bounds.getSouthWest();
                        var ne = bounds.getNorthEast();
                        var boundsData = { lat1: ne.getLat(), lng1: sw.getLng(), lat2: sw.getLat(), lng2: ne.getLng() };
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
                    }
                });
                
                var zoomTimer = null;
                kakao.maps.event.addListener(map, 'zoom_changed', function() {
                    if (window.isUpdatingMarkers) { return; }
                    if (zoomTimer) { clearTimeout(zoomTimer); }
                    zoomTimer = setTimeout(function() {
                        if (window.isUpdatingMarkers) { return; }
                        var center = map.getCenter();
                        var lat = center.getLat();
                        var lng = center.getLng();
                        var level = map.getLevel();
                        window.lastMapCenter = center;
                        if (level >= 7) { return; }
                        var bounds = map.getBounds();
                        var sw = bounds.getSouthWest();
                        var ne = bounds.getNorthEast();
                        var boundsData = { lat1: ne.getLat(), lng1: sw.getLng(), lat2: sw.getLat(), lng2: ne.getLng() };
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
            } catch (error) {
                setTimeout(initMap, 2000);
            }
        }

        function updateMarkers(newMarkers) {
            if (!window.kakaoMap) return;
            var currentCenter = window.kakaoMap.getCenter();
            var currentLevel = window.kakaoMap.getLevel();
            window.isUpdatingMarkers = true;
            if (window.apiMarkers) {
                window.apiMarkers.forEach(function(marker) { marker.setMap(null); });
            }
            window.apiMarkers = [];

            if (newMarkers.length > 0) {
                newMarkers.forEach(function(place, index) {
                    var lat = parseFloat(place.latitude);
                    var lng = parseFloat(place.longitude);
                    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                        var congestionColor = getCongestionColor(place.congestion_level);
                        var label = place.name || '';
                        var sizePx = 18; var borderPx = 2; var gapPx = 6; var labelH = 18; var totalH = sizePx + gapPx + labelH; var yAnchorVal = (sizePx/2) / totalH;
                        var markerContent = '<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;">' +
                            '<div style="width:' + sizePx + 'px;height:' + sizePx + 'px;background-color:' + congestionColor + ';border:' + borderPx + 'px solid #ffffff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>' +
                            (label ? '<div style="margin-top:' + gapPx + 'px;background:#ffffff;color:#333;font-size:12px;padding:2px 6px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap;border:1px solid rgba(0,0,0,0.08);">' + label + '</div>' : '') +
                        '</div>';
                        var customOverlay = new kakao.maps.CustomOverlay({
                            position: new kakao.maps.LatLng(lat, lng),
                            content: markerContent,
                            yAnchor: yAnchorVal,
                            xAnchor: 0.5
                        });
                        customOverlay.setMap(window.kakaoMap);

                        (function(overlay, placeObj) {
                            var overlayElement = overlay.getContent();
                            if (typeof overlayElement === 'string') {
                                var tempDiv = document.createElement('div');
                                tempDiv.innerHTML = overlayElement;
                                overlayElement = tempDiv.firstChild;
                                overlay.setContent(overlayElement);
                            }
                            overlayElement.addEventListener('click', function() {
                                try {
                                  if (window.ReactNativeWebView) {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                      type: 'poiClicked',
                                      placeId: placeObj.id,
                                      id: 'poi-' + placeObj.id,
                                      name: placeObj.name,
                                      latitude: lat,
                                      longitude: lng
                                    }));
                                  }
                                } catch (e) {}
                            });
                        })(customOverlay, place);
                        window.apiMarkers.push(customOverlay);
                    }
                });

                if (window.kakaoMap) {
                    var newCenter = window.kakaoMap.getCenter();
                    var newLevel = window.kakaoMap.getLevel();
                    if (Math.abs(newCenter.getLat() - currentCenter.getLat()) > 0.001 || 
                        Math.abs(newCenter.getLng() - currentCenter.getLng()) > 0.001) {
                        window.kakaoMap.panTo(currentCenter);
                    }
                    if (newLevel !== currentLevel) {
                        window.kakaoMap.setLevel(currentLevel, {animate: false});
                    }
                }
                window.isUpdatingMarkers = false;
            }
        }

        function handleRNMessage(event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type === 'updateMarkers') {
                    updateMarkers(data.markers);
                } else if (data.type === 'updatePlacePings') {
                    var len = (data.places && Array.isArray(data.places)) ? data.places.length : 0;
                    if (window.pingManager && len > 0) {
                        window.pingManager.addPlacePingsFromApiResponse(data.places);
                    } else if (len === 0) {
                        if (window.pingManager) {
                            window.pingManager.removePoiPings();
                        }
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
                    }
                }
            } catch (error) {}
        }
        window.addEventListener('message', handleRNMessage);
        if (document && document.addEventListener) { document.addEventListener('message', handleRNMessage); }

        function moveToLocation(latitude, longitude, showCurrentLocation) {
             if (window.kakaoMap) {
                 var moveLatLng = new kakao.maps.LatLng(latitude, longitude);
                 window.kakaoMap.setCenter(moveLatLng);
                 window.kakaoMap.setLevel(5);
                 if (window.pingManager) {
                     window.pingManager.updateCurrentLocationPing({
                         latitude: latitude,
                         longitude: longitude
                     }, false);
                 }
             }
         }

         function hideCurrentLocation() {
             if (window.pingManager) { window.pingManager.hideCurrentLocationPing(); }
         }

        function getCongestionColor(level) {
            // CongestionBadge 배경색 (switch 문의 backgroundColor 팔레트와 동일)
            if (level >= 4) {
                return { backgroundColor: '#FEE2E2' }; // 혼잡 (red-100)
            }
            if (level >= 3) {
                return { backgroundColor: '#FFEDD5' }; // 약간혼잡 (orange-100)
            }
            if (level >= 2) {
                return { backgroundColor: '#FEF9C3' }; // 보통 (yellow-100)
            }
            if (level >= 1) {
                return { backgroundColor: '#DCFCE7' }; // 여유 (green-100)
            }
            return { backgroundColor: '#F3F4F6' }; // 정보없음 (gray-100)
        }


        function getCongestionText(level) {
            if (level >= 4) return '매우혼잡';
            if (level >= 3) return '혼잡';
            if (level >= 2) return '보통';
            return '여유';
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() { initMap(); });
        } else {
            initMap();
        }
    </script>
</body>
</html>`;
};

export default createMapHTML;


