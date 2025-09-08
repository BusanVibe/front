import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {UserService} from '../services/userService';
import {togglePlaceLike as togglePlaceLikeApi} from '../services/placeService';
import {useAuth} from './AuthContext';
import {useToast} from './ToastContext';

interface LikesContextValue {
  likedPlaceIds: Set<number>;
  isPlaceLiked: (placeId: number) => boolean;
  togglePlaceLike: (placeId: number) => Promise<boolean>;
  refreshLikes: () => Promise<void>;
}

const LikesContext = createContext<LikesContextValue | undefined>(undefined);

export const LikesProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {user, isAuthenticated} = useAuth();
  const [likedPlaceIdsState, setLikedPlaceIdsState] = useState<Set<number>>(new Set());

  const refreshLikes = useCallback(async () => {
    try {
      if (!user?.accessToken) {
        setLikedPlaceIdsState(new Set());
        return;
      }
      // 전체 좋아요 목록에서 ID만 추출하여 상태로 관리
      const list = await UserService.getLikes(user.accessToken, 'ALL');
      const idSet = new Set<number>(list.map(item => item.id));
      setLikedPlaceIdsState(idSet);
    } catch (e) {
      // 실패 시 기존 상태 유지
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshLikes();
    } else {
      setLikedPlaceIdsState(new Set());
    }
  }, [isAuthenticated, refreshLikes]);

  const isPlaceLiked = useCallback((placeId: number) => {
    return likedPlaceIdsState.has(placeId);
  }, [likedPlaceIdsState]);

  const {showToast} = useToast();

  const togglePlaceLike = useCallback(async (placeId: number) => {
    const wasLiked = likedPlaceIdsState.has(placeId);
    const res = await togglePlaceLikeApi(placeId);
    if (res?.is_success) {
      setLikedPlaceIdsState(prev => {
        const next = new Set(prev);
        if (wasLiked) {
          next.delete(placeId);
        } else {
          next.add(placeId);
        }
        return next;
      });
      // 좋아요/해제 모두 동일한 배경색(해제 색상)으로 노출
      showToast(wasLiked ? '좋아요를 해제했습니다' : '좋아요를 눌렀습니다', {type: 'info'});
      return true;
    }
    showToast('처리에 실패했습니다', {type: 'error'});
    return false;
  }, [likedPlaceIdsState, showToast]);

  const value = useMemo<LikesContextValue>(() => ({
    likedPlaceIds: likedPlaceIdsState,
    isPlaceLiked,
    togglePlaceLike,
    refreshLikes,
  }), [likedPlaceIdsState, isPlaceLiked, togglePlaceLike, refreshLikes]);

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = (): LikesContextValue => {
  const ctx = useContext(LikesContext);
  if (!ctx) {
    throw new Error('useLikes must be used within LikesProvider');
  }
  return ctx;
};


