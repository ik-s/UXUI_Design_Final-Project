import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Cross, Hospital, MapPin } from "lucide-react";
import type { ManualMapLocation, SearchRadiusMeters } from "../../types";
import {
  getDistanceMeters,
  getFacilitiesInRadius,
  type MedicalFacility,
} from "../../data/medicalFacilities";
import {
  loadKakaoMapsSdk,
  toLatLng,
  type KakaoCircle,
  type KakaoCustomOverlay,
  type KakaoMap,
  type KakaoMarker,
  type KakaoNamespace,
} from "./kakaoMaps";

type FacilityWithDistance = MedicalFacility & {
  distanceMeters: number;
};

type MedicalFacilitiesMapProps = {
  location: ManualMapLocation;
  radiusMeters: SearchRadiusMeters;
  onBack: () => void;
};

export function MedicalFacilitiesMap({
  location,
  radiusMeters,
  onBack,
}: MedicalFacilitiesMapProps) {
  const apiKey = import.meta.env.VITE_KAKAO_MAPS_JAVASCRIPT_KEY as string | undefined;
  const [kakao, setKakao] = useState<KakaoNamespace | null>(null);
  const [sdkError, setSdkError] = useState("");
  const facilities = useMemo(
    () => getFacilitiesInRadius(location, radiusMeters),
    [location, radiusMeters],
  );
  const [selectedFacility, setSelectedFacility] = useState<FacilityWithDistance | null>(
    facilities[0] ?? null,
  );

  useEffect(() => {
    if (!apiKey) {
      setSdkError("Kakao Maps 키가 없어 프로토타입 지도 화면으로 보여드려요.");
      return;
    }

    let isMounted = true;
    loadKakaoMapsSdk(apiKey)
      .then((nextKakao) => {
        if (!isMounted) return;
        setKakao(nextKakao);
      })
      .catch(() => {
        if (!isMounted) return;
        setSdkError("Kakao Maps SDK를 불러오지 못해 프로토타입 지도 화면으로 보여드려요.");
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  useEffect(() => {
    setSelectedFacility(facilities[0] ?? null);
  }, [facilities]);

  return (
    <div className="facility-results-screen">
      <header className="facility-search-header">
        <button onClick={onBack} aria-label="위치 설정으로 돌아가기">
          <ArrowLeft size={22} />
        </button>
        <strong>병원</strong>
        <span>{radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`}</span>
      </header>

      <div className="facility-filter-row">
        <button className="active">장소</button>
        <button>병원</button>
        <button>약국</button>
      </div>

      <section className="facility-map-stage">
        {kakao ? (
          <KakaoFacilityMap
            kakao={kakao}
            location={location}
            radiusMeters={radiusMeters}
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
          />
        ) : (
          <FallbackFacilityMap
            location={location}
            radiusMeters={radiusMeters}
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
          />
        )}

        {sdkError && <p className="facility-map-note">{sdkError}</p>}

        <div className="facility-map-cta">
          <span>목록보기</span>
        </div>
      </section>

      <section className="facility-list-panel">
        {selectedFacility ? (
          <FacilityInfoCard facility={selectedFacility} />
        ) : (
          <div className="facility-empty-card">
            <strong>반경 안 의료시설이 없어요.</strong>
            <span>반경을 넓혀 다시 확인해 주세요.</span>
          </div>
        )}

        <div className="facility-chip-row">
          {facilities.map((facility) => (
            <button
              className={selectedFacility?.id === facility.id ? "selected" : ""}
              key={facility.id}
              onClick={() => setSelectedFacility(facility)}
            >
              {facility.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

type FacilityMapProps = {
  location: ManualMapLocation;
  radiusMeters: SearchRadiusMeters;
  facilities: FacilityWithDistance[];
  selectedFacility: FacilityWithDistance | null;
  onSelectFacility: (facility: FacilityWithDistance) => void;
};

function KakaoFacilityMap({
  kakao,
  location,
  radiusMeters,
  facilities,
  selectedFacility,
  onSelectFacility,
}: FacilityMapProps & { kakao: KakaoNamespace }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const userMarkerRef = useRef<KakaoMarker | null>(null);
  const overlayRefs = useRef<KakaoCustomOverlay[]>([]);
  const radiusCircleRef = useRef<KakaoCircle | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const center = toLatLng(kakao, location);
    const map =
      mapRef.current ??
      new kakao.maps.Map(container, {
        center,
        level: radiusMeters >= 2000 ? 6 : radiusMeters >= 1000 ? 5 : 4,
      });

    mapRef.current = map;
    map.setCenter(center);
    window.setTimeout(() => map.relayout(), 0);

    overlayRefs.current.forEach((overlay) => overlay.setMap(null));
    overlayRefs.current = [];
    userMarkerRef.current?.setMap(null);
    radiusCircleRef.current?.setMap(null);
    radiusCircleRef.current = new kakao.maps.Circle({
      center,
      radius: radiusMeters,
      strokeWeight: 2,
      strokeColor: "#49a67b",
      strokeOpacity: 0.8,
      fillColor: "#79c9a4",
      fillOpacity: 0.13,
    });
    radiusCircleRef.current.setMap(map);

    userMarkerRef.current = new kakao.maps.Marker({
      map,
      position: center,
    });

    facilities.forEach((facility) => {
      const content = document.createElement("button");
      content.className = `kakao-medical-marker ${
        selectedFacility?.id === facility.id ? "selected" : ""
      }`;
      content.type = "button";
      content.setAttribute("aria-label", facility.name);
      content.innerHTML = `<span>+</span><strong>${facility.name}</strong>`;
      content.addEventListener("click", () => onSelectFacility(facility));

      const overlay = new kakao.maps.CustomOverlay({
        map,
        position: toLatLng(kakao, facility),
        content,
        yAnchor: 0.9,
        zIndex: selectedFacility?.id === facility.id ? 20 : 10,
      });
      overlayRefs.current.push(overlay);
    });
  }, [facilities, kakao, location, onSelectFacility, radiusMeters, selectedFacility]);

  return (
    <>
      <div className="facility-kakao-map" ref={containerRef} aria-label="주변 의료시설 지도" />
      {selectedFacility && <FloatingFacilityLabel facility={selectedFacility} />}
    </>
  );
}

function FallbackFacilityMap({
  location,
  radiusMeters,
  facilities,
  selectedFacility,
  onSelectFacility,
}: FacilityMapProps) {
  return (
    <div className="facility-fallback-map" aria-label="주변 의료시설 프로토타입 지도">
      <div className="facility-radius-ring" />
      <div className="facility-user-pin">
        <MapPin size={24} />
      </div>
      {facilities.map((facility) => {
        const point = getFallbackPoint(location, facility, radiusMeters);
        return (
          <button
            className={`facility-marker ${selectedFacility?.id === facility.id ? "selected" : ""}`}
            key={facility.id}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onClick={() => onSelectFacility(facility)}
            aria-label={facility.name}
          >
            <Cross size={14} />
            <span>{facility.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function FloatingFacilityLabel({ facility }: { facility: FacilityWithDistance }) {
  return (
    <div className="floating-facility-label">
      <Cross size={14} />
      <strong>{facility.name}</strong>
    </div>
  );
}

function FacilityInfoCard({ facility }: { facility: FacilityWithDistance }) {
  const isOpen = facility.openStatus === "open";

  return (
    <article className="facility-info-card">
      <div className="facility-info-icon">
        <Hospital size={22} />
      </div>
      <div>
        <span className={isOpen ? "open" : "closed"}>
          {isOpen ? "현재 운영 중" : "현재 운영 종료"}
        </span>
        <h2>{facility.name}</h2>
        <p>
          {isOpen
            ? `오늘 ${facility.closesAt}까지 운영해요.`
            : `오늘 운영은 끝났어요. 내일 ${facility.opensAt ?? "09:00"}부터 운영해요.`}
        </p>
        <small>
          {facility.category} · {facility.distanceMeters}m · {facility.address}
        </small>
      </div>
    </article>
  );
}

function getFallbackPoint(
  origin: ManualMapLocation,
  facility: MedicalFacility,
  radiusMeters: SearchRadiusMeters,
) {
  const distance = getDistanceMeters(origin, facility);
  const lngMeters = (facility.longitude - origin.longitude) * 88_000;
  const latMeters = (facility.latitude - origin.latitude) * 111_000;
  const scale = Math.min(distance / radiusMeters, 1);
  const angle = Math.atan2(latMeters, lngMeters);

  return {
    x: clamp(50 + Math.cos(angle) * scale * 42, 7, 93),
    y: clamp(50 - Math.sin(angle) * scale * 42, 12, 88),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
