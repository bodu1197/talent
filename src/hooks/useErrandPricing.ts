'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  calculateErrandPrice,
  calculateMultiStopPrice,
  calculateShoppingPrice,
  calculateDistance,
  getCurrentTimeCondition,
} from '@/lib/errand-pricing';
import type {
  WeatherCondition,
  TimeCondition,
  WeightClass,
  PriceBreakdown,
  MultiStopPriceBreakdown,
  ShoppingPriceBreakdown,
  ShoppingRange,
} from '@/lib/errand-pricing';
import type { ErrandCategory, ShoppingItem, ErrandStop } from '@/types/errand';
import { logger } from '@/lib/logger';

interface LocationData {
  lat?: number;
  lng?: number;
}

interface UseErrandPricingProps {
  category: ErrandCategory;
  pickup: LocationData;
  delivery: LocationData;
  weight: WeightClass;
  // 다중 배달
  isMultiStop: boolean;
  stops: ErrandStop[];
  // 구매대행
  shoppingRange: ShoppingRange;
  shoppingItems: ShoppingItem[];
  shoppingLocation: LocationData;
  hasHeavyItem: boolean;
}

interface UseErrandPricingReturn {
  weather: WeatherCondition;
  weatherLoading: boolean;
  timeCondition: TimeCondition;
  distance: number;
  distanceLoading: boolean;
  estimatedDuration: number;
  priceBreakdown: PriceBreakdown | null;
  multiStopPrice: MultiStopPriceBreakdown | null;
  shoppingPrice: ShoppingPriceBreakdown | null;
}

export function useErrandPricing({
  category,
  pickup,
  delivery,
  weight,
  isMultiStop,
  stops,
  shoppingRange,
  shoppingItems,
  shoppingLocation,
  hasHeavyItem,
}: UseErrandPricingProps): UseErrandPricingReturn {
  const [weather, setWeather] = useState<WeatherCondition>('CLEAR');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [timeCondition, setTimeCondition] = useState<TimeCondition>('DAY');
  const [distance, setDistance] = useState<number>(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [multiStopPrice, setMultiStopPrice] = useState<MultiStopPriceBreakdown | null>(null);
  const [shoppingPrice, setShoppingPrice] = useState<ShoppingPriceBreakdown | null>(null);

  // 시간대 체크
  useEffect(() => {
    setTimeCondition(getCurrentTimeCondition());
  }, []);

  // 날씨 조회
  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data.weather as WeatherCondition);
      }
    } catch (err) {
      logger.error('날씨 조회 실패:', err);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // 도로 거리 계산
  const fetchRoadDistance = useCallback(async () => {
    if (!pickup.lat || !pickup.lng || !delivery.lat || !delivery.lng) {
      setDistance(0);
      setEstimatedDuration(0);
      return;
    }

    setDistanceLoading(true);
    try {
      const response = await fetch('/api/address/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: pickup.lat,
          originLng: pickup.lng,
          destLat: delivery.lat,
          destLng: delivery.lng,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDistance(data.distanceKm || 0);
        setEstimatedDuration(data.durationMin || 0);
      } else {
        applyFallbackDistance();
      }
    } catch (err) {
      logger.error('도로 거리 계산 실패:', err);
      applyFallbackDistance();
    } finally {
      setDistanceLoading(false);
    }

    function applyFallbackDistance() {
      if (!pickup.lat || !pickup.lng || !delivery.lat || !delivery.lng) return;
      const straightDist = calculateDistance(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
      setDistance(Math.round(straightDist * 1.4 * 10) / 10);
      setEstimatedDuration(Math.round(((straightDist * 1.4) / 30) * 60));
    }
  }, [pickup.lat, pickup.lng, delivery.lat, delivery.lng]);

  // 거리 계산 및 날씨 조회
  useEffect(() => {
    if (pickup.lat && pickup.lng && delivery.lat && delivery.lng) {
      fetchRoadDistance();
      fetchWeather(pickup.lat, pickup.lng);
    } else {
      setDistance(0);
      setEstimatedDuration(0);
    }
  }, [pickup.lat, pickup.lng, delivery.lat, delivery.lng, fetchRoadDistance, fetchWeather]);

  // 배달 가격 계산
  useEffect(() => {
    if (category !== 'DELIVERY') return;

    if (isMultiStop && stops.length > 0) {
      const breakdown = calculateMultiStopPrice({
        distance,
        weather,
        timeOfDay: timeCondition,
        weight,
        totalStops: stops.length + 1,
      });
      setMultiStopPrice(breakdown);
      setPriceBreakdown(breakdown);
      setShoppingPrice(null);
    } else {
      const breakdown = calculateErrandPrice({
        distance,
        weather,
        timeOfDay: timeCondition,
        weight,
      });
      setPriceBreakdown(breakdown);
      setMultiStopPrice(null);
      setShoppingPrice(null);
    }
  }, [category, distance, weather, timeCondition, weight, isMultiStop, stops.length]);

  // 구매대행 가격 계산
  useEffect(() => {
    if (category !== 'SHOPPING') return;

    let shoppingDistance = 0;
    if (
      shoppingRange === 'SPECIFIC' &&
      shoppingLocation.lat &&
      shoppingLocation.lng &&
      delivery.lat &&
      delivery.lng
    ) {
      shoppingDistance = calculateDistance(
        shoppingLocation.lat,
        shoppingLocation.lng,
        delivery.lat,
        delivery.lng
      );
    }

    const validItems = shoppingItems.filter((item) => item.name.trim() !== '');
    const breakdown = calculateShoppingPrice({
      range: shoppingRange,
      itemCount: validItems.length,
      distance: shoppingDistance,
      weather,
      timeOfDay: timeCondition,
      hasHeavyItem,
    });
    setShoppingPrice(breakdown);
    setPriceBreakdown(null);
    setMultiStopPrice(null);
  }, [
    category,
    weather,
    timeCondition,
    shoppingRange,
    shoppingItems,
    shoppingLocation.lat,
    shoppingLocation.lng,
    delivery.lat,
    delivery.lng,
    hasHeavyItem,
  ]);

  return {
    weather,
    weatherLoading,
    timeCondition,
    distance,
    distanceLoading,
    estimatedDuration,
    priceBreakdown,
    multiStopPrice,
    shoppingPrice,
  };
}
