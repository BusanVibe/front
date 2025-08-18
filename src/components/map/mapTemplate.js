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
                window.currentLocationMarker = null; // 현재 위치 마커
                window.currentLocationInfoWindow = null; // 현재 위치 인포윈도우
                window.isUpdatingMarkers = false; // 마커 업데이트 상태 초기화
                window.lastMapCenter = map.getCenter(); // 현재 지도 중심 저장
                
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
                
                // 현재 위치 마커 표시 (조건부)
                ${isCurrentLocation && currentLocation ? `
                window.currentLocationMarker = new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(${currentLocation.latitude}, ${currentLocation.longitude}),
                    title: '현재 위치'
                });
                window.currentLocationMarker.setMap(map);
                console.log('현재 위치 마커 생성 완료');
                
                // 현재 위치 커스텀 인포윈도우
                var currentLocationContent = '<div style="' +
                    'padding:0.8rem 1.2rem;' +
                    'font-size:0.9rem;' +
                    'text-align:center;' +
                    'background:white;' +
                    'border:0.15rem solid #4285F4;' +
                    'border-radius:0.6rem;' +
                    'min-width:8rem;' +
                    'max-width:10rem;' +
                    'box-shadow:0 0.15rem 0.6rem rgba(0,0,0,0.15);' +
                    'position:relative;' +
                    'transform:translateY(-100%);' +
                    'margin-bottom:1rem;' +
                    '">' +
                    '📍 <strong style="color:#4285F4;font-size:1rem;">현재 위치</strong>' +
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
                    'border-top:0.5rem solid #4285F4;' +
                    '"></div>' +
                    '</div>';
                
                window.currentLocationInfoWindow = new kakao.maps.CustomOverlay({
                    content: currentLocationContent,
                    position: new kakao.maps.LatLng(${currentLocation.latitude}, ${currentLocation.longitude}),
                    yAnchor: 1,
                    zIndex: 1000
                });
                window.currentLocationInfoWindow.setMap(map);
                
                // 7초 후 인포윈도우 닫기
                setTimeout(function() {
                    if (window.currentLocationInfoWindow) {
                        window.currentLocationInfoWindow.setMap(null);
                    }
                }, 7000);
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
                                yAnchor: 0.5
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
                        
                        // React Native로 좌표 전달
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'dragEnd',
                                latitude: lat,
                                longitude: lng,
                                dragDistance: dragDistance,
                                zoomLevel: currentZoomLevel
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
                        
                        // React Native로 좌표 전달
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'zoomChanged',
                                latitude: lat,
                                longitude: lng,
                                zoomLevel: level
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
                            yAnchor: 0.5
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

        // React Native에서 메시지 수신
        window.addEventListener('message', function(event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type === 'updateMarkers') {
                    updateMarkers(data.markers);
                } else if (data.type === 'moveToLocation') {
                    moveToLocation(data.latitude, data.longitude, data.showCurrentLocation);
                } else if (data.type === 'hideCurrentLocation') {
                    hideCurrentLocation();
                }
            } catch (error) {
                console.error('메시지 파싱 오류:', error);
            }
        });

                 // 지도 중심 이동 함수
         function moveToLocation(latitude, longitude, showCurrentLocation) {
             console.log('지도 중심 이동:', latitude, longitude);
             
             if (window.kakaoMap) {
                 var moveLatLng = new kakao.maps.LatLng(latitude, longitude);
                 window.kakaoMap.setCenter(moveLatLng);
                 window.kakaoMap.setLevel(5); // 현재위치 버튼 클릭 시 기본 줌 레벨 5로 설정
                 console.log('줌 레벨을 5로 설정했습니다');
                 
                 // 현재 위치 마커 표시가 필요한 경우
                 if (showCurrentLocation) {
                     // 기존 현재위치 마커 제거
                     if (window.currentLocationMarker) {
                         window.currentLocationMarker.setMap(null);
                     }
                     if (window.currentLocationInfoWindow) {
                         window.currentLocationInfoWindow.close();
                     }
                     
                     // 새로운 현재위치 마커 생성
                     window.currentLocationMarker = new kakao.maps.Marker({
                         position: moveLatLng,
                         title: '현재 위치'
                     });
                     window.currentLocationMarker.setMap(window.kakaoMap);
                     
                     // 현재 위치 커스텀 인포윈도우
                     var currentLocationContent = '<div style="' +
                         'padding:0.8rem 1.2rem;' +
                         'font-size:0.9rem;' +
                         'text-align:center;' +
                         'background:white;' +
                         'border:0.15rem solid #4285F4;' +
                         'border-radius:0.6rem;' +
                         'min-width:8rem;' +
                         'max-width:10rem;' +
                         'box-shadow:0 0.15rem 0.6rem rgba(0,0,0,0.15);' +
                         'position:relative;' +
                         'transform:translateY(-100%);' +
                         'margin-bottom:1rem;' +
                         '">' +
                         '📍 <strong style="color:#4285F4;font-size:1rem;">현재 위치</strong>' +
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
                         'border-top:0.5rem solid #4285F4;' +
                         '"></div>' +
                         '</div>';
                     
                     window.currentLocationInfoWindow = new kakao.maps.CustomOverlay({
                         content: currentLocationContent,
                         position: moveLatLng,
                         yAnchor: 1,
                         zIndex: 1000
                     });
                     window.currentLocationInfoWindow.setMap(window.kakaoMap);
                     
                     // 7초 후 인포윈도우 닫기
                     setTimeout(function() {
                         if (window.currentLocationInfoWindow) {
                             window.currentLocationInfoWindow.setMap(null);
                         }
                     }, 7000);
                 }
                 
                 console.log('지도 중심 이동 완료');
             }
         }

         // 현재 위치 마커 숨기기 함수
         function hideCurrentLocation() {
             console.log('현재 위치 마커 숨기기');
             
             if (window.currentLocationMarker) {
                 window.currentLocationMarker.setMap(null);
                 window.currentLocationMarker = null;
             }
             if (window.currentLocationInfoWindow) {
                 window.currentLocationInfoWindow.setMap(null);
                 window.currentLocationInfoWindow = null;
             }
             
             console.log('현재 위치 마커 숨기기 완료');
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
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMap);
        } else {
            initMap();
        }
    </script>
</body>
</html>`;
};