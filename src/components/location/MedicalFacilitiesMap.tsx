import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Cross, ExternalLink, Hospital, MapPin, Phone } from "lucide-react";
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
  type KakaoPlaceResult,
  type KakaoPlacesSearchOptions,
} from "./kakaoMaps";

type FacilityWithDistance = MedicalFacility & {
  distanceMeters: number;
};

type FacilityCategoryId = "all" | "hospital" | "pharmacy" | "emergency";

type FacilitySearchDefinition = {
  categoryLabel: string;
  query: string;
  searchType: "category" | "keyword";
  type: "hospital" | "pharmacy" | "keyword";
};

type MedicalFacilitiesMapProps = {
  location: ManualMapLocation;
  radiusMeters: SearchRadiusMeters;
  onBack: () => void;
};

const radiusOptions: Array<{ label: string; value: SearchRadiusMeters }> = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "2km", value: 2000 },
  { label: "3km", value: 3000 },
];

const categoryOptions: Array<{ id: FacilityCategoryId; label: string }> = [
  { id: "all", label: "전체" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
  { id: "emergency", label: "응급" },
];

const searchDefinitions: Record<FacilityCategoryId, FacilitySearchDefinition[]> = {
  all: [
    { categoryLabel: "병원", query: "HP8", searchType: "category", type: "hospital" },
    { categoryLabel: "약국", query: "PM9", searchType: "category", type: "pharmacy" },
  ],
  hospital: [{ categoryLabel: "병원", query: "HP8", searchType: "category", type: "hospital" }],
  pharmacy: [{ categoryLabel: "약국", query: "PM9", searchType: "category", type: "pharmacy" }],
  emergency: [{ categoryLabel: "응급", query: "응급실", searchType: "keyword", type: "keyword" }],
};

const extendableKeywordSearches = ["내과", "치과", "산부인과", "정형외과"];
const emergencyMedicalKeywords = ["응급실", "응급의료", "응급센터", "병원", "의원", "의료원"];

export function MedicalFacilitiesMap({
  location,
  radiusMeters,
  onBack,
}: MedicalFacilitiesMapProps) {
  const apiKey = import.meta.env.VITE_KAKAO_MAPS_JAVASCRIPT_KEY as string | undefined;
  const [kakao, setKakao] = useState<KakaoNamespace | null>(null);
  const [sdkError, setSdkError] = useState("");
  const [selectedRadius, setSelectedRadius] = useState<SearchRadiusMeters>(
    normalizeRadius(radiusMeters),
  );
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategoryId>("all");
  const [facilities, setFacilities] = useState<FacilityWithDistance[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityWithDistance | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [searchError, setSearchError] = useState("");

  const fallbackFacilities = useMemo(
    () => getFallbackFacilities(location, selectedRadius, selectedCategory),
    [location, selectedCategory, selectedRadius],
  );

  useEffect(() => {
    setSelectedRadius(normalizeRadius(radiusMeters));
  }, [radiusMeters]);

  useEffect(() => {
    if (!apiKey) {
      setSdkError("Kakao Maps 키가 없어 프로토타입 의료기관 목록으로 보여드려요.");
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
        setSdkError("Kakao Maps SDK를 불러오지 못해 프로토타입 의료기관 목록으로 보여드려요.");
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  useEffect(() => {
    let isMounted = true;

    setSearchError("");
    setFacilities([]);
    setSelectedFacility(null);

    if (!apiKey || sdkError) {
      setIsSearching(false);
      setFacilities(fallbackFacilities);
      return () => {
        isMounted = false;
      };
    }

    if (!kakao) {
      setIsSearching(true);
      return () => {
        isMounted = false;
      };
    }

    if (!kakao.maps.services?.Places || !kakao.maps.services.SortBy?.DISTANCE) {
      setSdkError("Kakao services 라이브러리가 포함되지 않아 프로토타입 의료기관 목록으로 보여드려요.");
      setIsSearching(false);
      setFacilities(fallbackFacilities);
      return () => {
        isMounted = false;
      };
    }

    setIsSearching(true);
    searchKakaoMedicalFacilities(kakao, location, selectedRadius, selectedCategory)
      .then((nextFacilities) => {
        if (!isMounted) return;
        setFacilities(nextFacilities);
      })
      .catch(() => {
        if (!isMounted) return;
        setSearchError("의료기관 정보를 불러오지 못했어요.");
        setFacilities(fallbackFacilities);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, fallbackFacilities, kakao, location, sdkError, selectedCategory, selectedRadius]);

  useEffect(() => {
    setSelectedFacility(facilities[0] ?? null);
  }, [facilities]);

  useEffect(() => {
    setIsListExpanded(false);
  }, [selectedCategory, selectedRadius]);

  return (
    <div className="facility-results-screen">
      <header className="facility-search-header">
        <button onClick={onBack} aria-label="위치 설정으로 돌아가기">
          <ArrowLeft size={22} />
        </button>
      </header>

      <section className="facility-control-group">
        <div className="facility-radius-row" aria-label="검색 반경">
          {radiusOptions.map((option) => (
            <button
              className={selectedRadius === option.value ? "active" : ""}
              key={option.value}
              onClick={() => setSelectedRadius(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="facility-filter-row" aria-label="의료기관 카테고리">
          {categoryOptions.map((option) => (
            <button
              className={selectedCategory === option.id ? "active" : ""}
              key={option.id}
              onClick={() => setSelectedCategory(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="facility-map-stage">
        {kakao ? (
          <KakaoFacilityMap
            kakao={kakao}
            location={location}
            radiusMeters={selectedRadius}
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
          />
        ) : (
          <FallbackFacilityMap
            location={location}
            radiusMeters={selectedRadius}
            facilities={facilities.length ? facilities : fallbackFacilities}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
          />
        )}

        {(isSearching || sdkError || searchError) && (
          <p className="facility-map-note">
            {isSearching ? "주변 의료기관을 찾고 있어요." : searchError || sdkError}
          </p>
        )}

        <button
          className="facility-map-cta"
          disabled={!facilities.length || isSearching}
          onClick={() => setIsListExpanded((current) => !current)}
        >
          <span>{isListExpanded ? "목록접기" : "목록보기"}</span>
        </button>
      </section>

      <section className="facility-list-panel">
        {isListExpanded && !isSearching && facilities.length > 0 && (
          <div className="facility-expanded-list">
            <header>
              <strong>반경 내 의료기관</strong>
              <span>{facilities.length}곳</span>
            </header>
            {facilities.map((facility) => (
              <button
                className={selectedFacility?.id === facility.id ? "selected" : ""}
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
              >
                <strong>{facility.name}</strong>
                <span>
                  {formatDistance(facility.distanceMeters)} ·{" "}
                  {facility.roadAddress || facility.address}
                </span>
              </button>
            ))}
          </div>
        )}

        {isSearching ? (
          <div className="facility-loading-card">
            <strong>주변 의료기관을 찾고 있어요.</strong>
            <span>{formatRadius(selectedRadius)} 안의 결과를 가까운 순서로 정리하고 있어요.</span>
          </div>
        ) : selectedFacility ? (
          <FacilityInfoCard facility={selectedFacility} />
        ) : (
          <div className="facility-empty-card">
            <strong>선택한 반경 안에 의료기관이 없어요.</strong>
            <span>반경을 넓혀서 다시 찾아보세요.</span>
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
        level: radiusMeters >= 5000 ? 7 : radiusMeters >= 3000 ? 6 : radiusMeters >= 1000 ? 5 : 4,
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
      const icon = document.createElement("span");

      content.className = `kakao-medical-marker ${
        selectedFacility?.id === facility.id ? "selected" : ""
      }`;
      content.type = "button";
      content.setAttribute("aria-label", facility.name);
      icon.textContent = facility.type === "pharmacy" ? "P" : "+";
      content.append(icon);
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
      <div className="facility-kakao-map" ref={containerRef} aria-label="주변 의료기관 지도" />
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
    <div className="facility-fallback-map" aria-label="주변 의료기관 프로토타입 지도">
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

function FacilityInfoCard({ facility }: { facility: FacilityWithDistance }) {
  const isOpen = facility.openStatus === "open";
  const address = facility.roadAddress || facility.address;
  const hasOpenStatus = Boolean(facility.openStatus);

  return (
    <article className="facility-info-card">
      <div className="facility-info-icon">
        <Hospital size={22} />
      </div>
      <div>
        <span className={hasOpenStatus && !isOpen ? "closed" : "open"}>
          {hasOpenStatus ? (isOpen ? "현재 운영 중" : "현재 운영 종료") : facility.category}
        </span>
        <h2>{facility.name}</h2>
        <p>
          {hasOpenStatus
            ? isOpen
              ? `오늘 ${facility.closesAt ?? "운영 종료 전"}까지 운영해요.`
              : `오늘 운영은 끝났어요. 내일 ${facility.opensAt ?? "09:00"}부터 운영해요.`
            : address}
        </p>
        <small>
          {facility.category} · {formatDistance(facility.distanceMeters)} · {address}
          {facility.phone ? ` · ${facility.phone}` : ""}
        </small>
        <div className="facility-info-actions">
          {facility.phone ? (
            <a href={`tel:${facility.phone.replace(/[^0-9+]/g, "")}`}>
              <Phone size={14} />
              전화하기
            </a>
          ) : (
            <span>전화번호 없음</span>
          )}
          {facility.placeUrl && (
            <a href={facility.placeUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={14} />
              지도에서 보기
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

async function searchKakaoMedicalFacilities(
  kakao: KakaoNamespace,
  origin: ManualMapLocation,
  selectedRadius: SearchRadiusMeters,
  selectedCategory: FacilityCategoryId,
) {
  const places = new kakao.maps.services.Places();
  const options: KakaoPlacesSearchOptions = {
    location: new kakao.maps.LatLng(origin.latitude, origin.longitude),
    radius: selectedRadius,
    sort: kakao.maps.services.SortBy.DISTANCE,
  };

  const results = await Promise.all(
    searchDefinitions[selectedCategory].map((definition) =>
      searchPlaces(kakao, places, definition, options, origin),
    ),
  );

  return dedupeFacilities(results.flat(), selectedRadius);
}

function searchPlaces(
  kakao: KakaoNamespace,
  places: InstanceType<KakaoNamespace["maps"]["services"]["Places"]>,
  definition: FacilitySearchDefinition,
  options: KakaoPlacesSearchOptions,
  origin: ManualMapLocation,
) {
  return new Promise<FacilityWithDistance[]>((resolve, reject) => {
    const callback = (result: KakaoPlaceResult[], status: string) => {
      if (status === kakao.maps.services.Status.OK) {
        resolve(
          result
            .map((place) => normalizePlaceResult(place, definition, origin))
            .filter((facility): facility is FacilityWithDistance => Boolean(facility)),
        );
        return;
      }

      if (status === kakao.maps.services.Status.ZERO_RESULT || status === "ZERO_RESULT") {
        resolve([]);
        return;
      }

      reject(new Error(`Kakao Places search failed: ${status}`));
    };

    if (definition.searchType === "category") {
      places.categorySearch(definition.query, callback, options);
      return;
    }

    places.keywordSearch(definition.query, callback, options);
  });
}

function normalizePlaceResult(
  place: KakaoPlaceResult,
  definition: FacilitySearchDefinition,
  origin: ManualMapLocation,
): FacilityWithDistance | null {
  const latitude = Number(place.y);
  const longitude = Number(place.x);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !place.place_name) return null;
  if (definition.query === "응급실" && !isEmergencyMedicalPlace(place)) return null;

  const distanceMeters = Number(place.distance) || Math.round(getDistanceMeters(origin, {
    latitude,
    longitude,
  }));

  return {
    id: `${definition.type}-${place.id || `${latitude}-${longitude}-${place.place_name}`}`,
    name: place.place_name,
    category: place.category_name || definition.categoryLabel,
    address: place.address_name || place.road_address_name || "주소 정보 없음",
    roadAddress: place.road_address_name || undefined,
    latitude,
    longitude,
    phone: place.phone || "",
    placeUrl: place.place_url || undefined,
    type: definition.type,
    distanceMeters,
  };
}

function dedupeFacilities(facilities: FacilityWithDistance[], radiusMeters: SearchRadiusMeters) {
  const facilityMap = new Map<string, FacilityWithDistance>();

  facilities
    .filter((facility) => facility.distanceMeters <= radiusMeters)
    .forEach((facility) => {
      const key = facility.id || `${facility.name}-${facility.latitude}-${facility.longitude}`;
      const previous = facilityMap.get(key);
      if (!previous || facility.distanceMeters < previous.distanceMeters) {
        facilityMap.set(key, facility);
      }
    });

  return Array.from(facilityMap.values()).sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function isEmergencyMedicalPlace(place: KakaoPlaceResult) {
  const searchableText = [
    place.place_name,
    place.category_name,
    place.address_name,
    place.road_address_name,
  ]
    .filter(Boolean)
    .join(" ");

  return emergencyMedicalKeywords.some((keyword) => searchableText.includes(keyword));
}

function getFallbackFacilities(
  origin: ManualMapLocation,
  radiusMeters: SearchRadiusMeters,
  selectedCategory: FacilityCategoryId,
): FacilityWithDistance[] {
  const facilities = getFacilitiesInRadius(origin, radiusMeters).map((facility) => {
    const type: FacilityWithDistance["type"] =
      facility.category === "약국" ? "pharmacy" : "hospital";

    return {
      ...facility,
      type,
    };
  });

  if (selectedCategory === "all") return facilities;
  if (selectedCategory === "hospital") {
    return facilities.filter((facility) => facility.category !== "약국");
  }
  if (selectedCategory === "pharmacy") {
    return facilities.filter((facility) => facility.category === "약국");
  }

  return facilities.filter((facility) =>
    [facility.name, facility.category, facility.address, ...extendableKeywordSearches]
      .join(" ")
      .includes("응급"),
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

function formatRadius(radiusMeters: SearchRadiusMeters) {
  return radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`;
}

function normalizeRadius(radiusMeters: number): SearchRadiusMeters {
  const matchedRadius = radiusOptions.find((option) => option.value === radiusMeters);
  return matchedRadius?.value ?? 1000;
}

function formatDistance(distanceMeters: number) {
  return distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)}km` : `${distanceMeters}m`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
