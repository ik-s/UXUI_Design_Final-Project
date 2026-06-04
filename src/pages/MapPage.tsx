import { useEffect, useState } from "react";
import { KakaoLocationPicker } from "../components/location/KakaoLocationPicker";
import { MedicalFacilitiesMap } from "../components/location/MedicalFacilitiesMap";
import { seoulNeighborhoods } from "../data/seoulNeighborhoods";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import type { Coordinates, ManualMapLocation, SearchRadiusMeters } from "../types";

type ConfirmedSearchLocation = {
  location: ManualMapLocation;
  radiusMeters: SearchRadiusMeters;
};

type MapPageProps = {
  neighborhood: string;
  onNeighborhoodChange: (value: string) => void;
};

export function MapPage({ neighborhood, onNeighborhoodChange }: MapPageProps) {
  const [confirmedSearch, setConfirmedSearch] = useLocalStorageState<ConfirmedSearchLocation | null>(
    "mojiday:confirmedSearch",
    null,
  );
  const [mode, setMode] = useState<"setup" | "facilities">("setup");
  const [showLocationComplete, setShowLocationComplete] = useState(false);
  const [showNeighborAdded, setShowNeighborAdded] = useState(false);
  const [hasAcknowledgedLocation, setHasAcknowledgedLocation] = useState(Boolean(confirmedSearch));
  const [showNeighborPrompt, setShowNeighborPrompt] = useState(false);
  const initialCoordinates = confirmedSearch
    ? {
        latitude: confirmedSearch.location.latitude,
        longitude: confirmedSearch.location.longitude,
      }
    : getNeighborhoodCoordinates(neighborhood);

  useEffect(() => {
    document.querySelector(".phone-frame")?.scrollTo({ top: 0 });
    document.querySelector(".screen-map")?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [mode]);

  if (mode === "facilities" && confirmedSearch) {
    return (
      <MedicalFacilitiesMap
        location={confirmedSearch.location}
        radiusMeters={confirmedSearch.radiusMeters}
        onBack={() => setMode("setup")}
      />
    );
  }

  return (
    <div className="map-screen tab-screen">
      <section className="manual-map-header">
        <span>동네 위치 설정</span>
        <h1>내 위치를 직접 설정하세요.</h1>
        <p>
          {neighborhood
            ? `${neighborhood}을 기준으로 지도를 열었어요. 세부 위치가 다르면 지도를 움직여 직접 맞춰주세요.`
            : "현재 위치가 정확하지 않다면 지도를 움직여 위치를 직접 맞춰주세요."}
        </p>
      </section>

      <KakaoLocationPicker
        initialCoordinates={initialCoordinates}
        onSubmit={(location, radiusMeters) => {
          const nextNeighborhood = location.neighborhood || getNeighborhoodFromAddress(location.address);
          setConfirmedSearch({ location, radiusMeters });
          if (nextNeighborhood) onNeighborhoodChange(nextNeighborhood);
          setShowLocationComplete(true);
          setHasAcknowledgedLocation(false);
          setShowNeighborPrompt(false);
        }}
      />

      {showLocationComplete && confirmedSearch && (
        <div className="location-complete-backdrop" role="dialog" aria-modal="true">
          <section className="location-complete-dialog">
            <strong>위치 설정이 완료되었습니다!</strong>
            <p>현재 위치 : {confirmedSearch.location.address || "선택한 위치"}</p>
            <button
              className="primary-button"
              onClick={() => {
                setShowLocationComplete(false);
                setHasAcknowledgedLocation(true);
                setShowNeighborPrompt(true);
              }}
            >
              확인
            </button>
          </section>
        </div>
      )}

      {showNeighborAdded && (
        <div className="location-complete-backdrop" role="dialog" aria-modal="true">
          <section className="location-complete-dialog">
            <strong>주변 이웃이 추가 되었습니다!</strong>
            <p>이웃 목록에서 확인해보세요.</p>
            <button className="primary-button" onClick={() => setShowNeighborAdded(false)}>
              확인
            </button>
          </section>
        </div>
      )}

      {confirmedSearch && hasAcknowledgedLocation && showNeighborPrompt && (
        <section className="neighbor-radius-card">
          <strong>반경 주변 이웃을 추가하시겠습니까?</strong>
          <p>현재 위치를 수정하면 이웃도 함께 수정됩니다.</p>
          <div className="neighbor-radius-actions">
            <button
              onClick={() => {
                setShowNeighborPrompt(false);
                setShowNeighborAdded(true);
              }}
            >
              예
            </button>
            <button onClick={() => setShowNeighborPrompt(false)}>아니오</button>
          </div>
        </section>
      )}

      {confirmedSearch && hasAcknowledgedLocation && (
        <button className="manual-location-summary" onClick={() => setMode("facilities")}>
          주변 의료 시설 확인하기
        </button>
      )}
    </div>
  );
}

function getNeighborhoodCoordinates(neighborhood: string): Coordinates | undefined {
  const normalized = neighborhood.replace(/\s/g, "");
  const matched = seoulNeighborhoods.find((item) => {
    const label = `${item.gu}${item.dong}`;
    return normalized === label || normalized.includes(item.dong);
  });

  if (!matched) return undefined;

  return {
    latitude: matched.lat,
    longitude: matched.lng,
  };
}

function getNeighborhoodFromAddress(address: string) {
  const parts = address.split(/\s+/).filter(Boolean);
  const gu = parts.find((part) => part.endsWith("구"));
  const dong = parts.find((part) => part.endsWith("동"));

  if (gu && dong) return `${gu} ${dong}`;
  return "";
}
