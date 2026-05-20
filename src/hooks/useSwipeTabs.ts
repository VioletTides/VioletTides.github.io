import { useCallback, useRef, type TouchEvent } from 'react';

import { TAB_ORDER } from '../constants/navigation';
import type { View } from '../types';

const SWIPE_THRESHOLD_PX = 50;
const HORIZONTAL_DOMINANCE = 1.25;

type SwipeDirection = 'next' | 'prev';

export function useSwipeTabs({
  enabled,
  currentView,
  onNavigate,
}: {
  enabled: boolean;
  currentView: View;
  onNavigate: (view: View) => void;
}) {
  const tabOrder = TAB_ORDER;
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipe = useRef(false);

  const navigateRelative = useCallback(
    (direction: SwipeDirection) => {
      const index = tabOrder.indexOf(currentView);
      if (index === -1) {
        return;
      }

      const nextIndex = direction === 'next' ? index + 1 : index - 1;
      const nextView = tabOrder[nextIndex];
      if (nextView) {
        onNavigate(nextView);
      }
    },
    [currentView, onNavigate, tabOrder],
  );

  const onTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      isHorizontalSwipe.current = false;
    },
    [enabled],
  );

  const onTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || !touchStart.current || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (!isHorizontalSwipe.current) {
        if (absX < 12) {
          return;
        }
        if (absX < absY * HORIZONTAL_DOMINANCE) {
          touchStart.current = null;
          return;
        }
        isHorizontalSwipe.current = true;
      }
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!enabled || !touchStart.current) {
        return;
      }

      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      touchStart.current = null;

      const wasHorizontal = isHorizontalSwipe.current;
      isHorizontalSwipe.current = false;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (!wasHorizontal && (absX < SWIPE_THRESHOLD_PX || absX < absY * HORIZONTAL_DOMINANCE)) {
        return;
      }

      if (absX < SWIPE_THRESHOLD_PX) {
        return;
      }

      if (dx < 0) {
        navigateRelative('next');
      } else {
        navigateRelative('prev');
      }
    },
    [enabled, navigateRelative],
  );

  const onTouchCancel = useCallback(() => {
    touchStart.current = null;
    isHorizontalSwipe.current = false;
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}
