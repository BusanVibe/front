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
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
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
                    level: 3
                };
                
                var map = new kakao.maps.Map(container, options);
                window.kakaoMap = map; // 전역 변수로 저장
                window.apiMarkers = []; // API 마커들을 저장할 배열
                window.currentLocationMarker = null; // 현재 위치 마커
                window.currentLocationInfoWindow = null; // 현재 위치 인포윈도우
                console.log('지도 생성 완료');
                
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
                kakao.maps.event.addListener(map, 'dragstart', function() {
                    console.log('지도 드래그 시작');
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'dragStart'
                        }));
                    }
                });
                
                // 지도 드래그 완료 이벤트
                kakao.maps.event.addListener(map, 'dragend', function() {
                    var center = map.getCenter();
                    var lat = center.getLat();
                    var lng = center.getLng();
                    console.log('지도 드래그 완료:', lat, lng);
                    
                    // React Native로 좌표 전달
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'dragEnd',
                            latitude: lat,
                            longitude: lng
                        }));
                    }
                });
                
                // 줌 레벨 변경 완료 시에도 API 호출
                kakao.maps.event.addListener(map, 'zoom_changed', function() {
                    var center = map.getCenter();
                    var lat = center.getLat();
                    var lng = center.getLng();
                    console.log('지도 줌 변경 완료:', lat, lng);
                    
                    // React Native로 좌표 전달
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'zoomChanged',
                            latitude: lat,
                            longitude: lng
                        }));
                    }
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