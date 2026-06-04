import { useEffect, useRef } from "react";
import type { Coordinates } from "../../types";
import {
  pickAddress,
  pickNeighborhood,
  toCoordinates,
  toLatLng,
  type KakaoMap,
  type KakaoMarker,
  type KakaoNamespace,
} from "./kakaoMaps";

type KakaoMapCanvasProps = {
  kakao: KakaoNamespace;
  selectedCoordinates: Coordinates;
  onSelectCoordinates: (coordinates: Coordinates) => void;
  onAddressChange: (address: string, errorMessage?: string, neighborhood?: string) => void;
};

export function KakaoMapCanvas({
  kakao,
  selectedCoordinates,
  onSelectCoordinates,
  onAddressChange,
}: KakaoMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const geocoderRef = useRef<InstanceType<KakaoNamespace["maps"]["services"]["Geocoder"]> | null>(
    null,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const center = toLatLng(kakao, selectedCoordinates);
    const map = new kakao.maps.Map(container, {
      center,
      level: 3,
    });
    const marker = new kakao.maps.Marker({
      map,
      position: center,
      draggable: true,
    });

    mapRef.current = map;
    markerRef.current = marker;
    geocoderRef.current = new kakao.maps.services.Geocoder();

    kakao.maps.event.addListener(map, "click", (event) => {
      onSelectCoordinates(toCoordinates(event.latLng));
    });

    kakao.maps.event.addListener(marker, "dragend", () => {
      onSelectCoordinates(toCoordinates(marker.getPosition()));
    });

    window.setTimeout(() => map.relayout(), 0);
  }, [kakao, onSelectCoordinates, selectedCoordinates]);

  useEffect(() => {
    const nextPosition = toLatLng(kakao, selectedCoordinates);
    mapRef.current?.setCenter(nextPosition);
    markerRef.current?.setPosition(nextPosition);
  }, [kakao, selectedCoordinates]);

  useEffect(() => {
    const geocoder = geocoderRef.current;
    if (!geocoder) return;

    let isCurrent = true;
    onAddressChange("주소를 확인하는 중이에요.");

    geocoder.coord2Address(
      selectedCoordinates.longitude,
      selectedCoordinates.latitude,
      (result, status) => {
        if (!isCurrent) return;

        if (status !== kakao.maps.services.Status.OK) {
          onAddressChange("", "주소 변환에 실패했어요. 지도를 조금 움직여 다시 선택해 주세요.");
          return;
        }

        const address = pickAddress(result);
        const neighborhood = pickNeighborhood(result);
        if (!address) {
          onAddressChange("", "선택한 좌표의 주소를 찾지 못했어요.");
          return;
        }

        onAddressChange(address, undefined, neighborhood);
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [kakao, onAddressChange, selectedCoordinates]);

  return <div className="kakao-map-canvas" ref={containerRef} aria-label="위치 선택 지도" />;
}
