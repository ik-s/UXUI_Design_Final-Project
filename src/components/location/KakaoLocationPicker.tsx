import { useCallback, useEffect, useMemo, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import type { Coordinates, ManualMapLocation, SearchRadiusMeters } from "../../types";
import { KakaoMapCanvas } from "./KakaoMapCanvas";
import { ManualLocationPanel } from "./ManualLocationPanel";
import { createManualMapLocation, submitManualMapLocation } from "./locationPayload";
import { loadKakaoMapsSdk, type KakaoNamespace } from "./kakaoMaps";

const DEFAULT_CENTER: Coordinates = {
  latitude: 37.5446,
  longitude: 127.0713,
};

const radiusOptions: Array<{ label: string; value: SearchRadiusMeters }> = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "2km", value: 2000 },
  { label: "3km", value: 3000 },
];

type SdkStatus = "missing_key" | "loading" | "ready" | "failed";

type KakaoLocationPickerProps = {
  initialCoordinates?: Coordinates;
  onSubmit: (location: ManualMapLocation, radiusMeters: SearchRadiusMeters) => void;
};

export function KakaoLocationPicker({ initialCoordinates, onSubmit }: KakaoLocationPickerProps) {
  const apiKey = import.meta.env.VITE_KAKAO_MAPS_JAVASCRIPT_KEY as string | undefined;
  const [kakao, setKakao] = useState<KakaoNamespace | null>(null);
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>(apiKey ? "loading" : "missing_key");
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates>(
    initialCoordinates ?? DEFAULT_CENTER,
  );
  const [radiusMeters, setRadiusMeters] = useState<SearchRadiusMeters | "">(1000);
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [geoError, setGeoError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  useEffect(() => {
    if (!apiKey) return;

    let isMounted = true;
    setSdkStatus("loading");

    loadKakaoMapsSdk(apiKey)
      .then((nextKakao) => {
        if (!isMounted) return;
        setKakao(nextKakao);
        setSdkStatus("ready");
      })
      .catch(() => {
        if (!isMounted) return;
        setSdkStatus("failed");
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  const moveToCurrentLocation = useCallback((isInitialRequest = false) => {
    if (!navigator.geolocation) {
      setGeoError("이 브라우저에서는 현재 위치 기능을 사용할 수 없어요.");
      return;
    }

    setGeoError(isInitialRequest ? "" : "현재 위치를 확인하고 있어요.");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoError("");
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        setGeoError(
          denied
            ? "위치 권한이 거부되어 기본 위치로 지도를 보여드려요. 지도에서 직접 위치를 맞춰주세요."
            : "현재 위치를 불러오지 못했어요. 기본 위치에서 직접 선택해 주세요.",
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 8_000,
      },
    );
  }, []);

  const handleAddressChange = useCallback((nextAddress: string, errorMessage?: string, nextNeighborhood?: string) => {
    setAddress(nextAddress);
    setNeighborhood(nextNeighborhood ?? "");
    setAddressError(errorMessage ?? "");
    setIsAddressLoading(nextAddress === "주소를 확인하는 중이에요.");
  }, []);

  const handleSubmit = async () => {
    if (!radiusMeters) {
      setSubmitError("반경을 설정해주세요!");
      return;
    }

    const location = createManualMapLocation({
      coordinates: selectedCoordinates,
      address,
      detailAddress: "",
      neighborhood,
    });
    const savedLocation = await submitManualMapLocation(location);
    setSubmitError("");
    onSubmit(savedLocation, radiusMeters);
  };

  const fallbackMessage = useMemo(() => {
    if (sdkStatus === "missing_key") {
      return ".env 파일에 VITE_KAKAO_MAPS_JAVASCRIPT_KEY를 설정하면 지도를 불러올 수 있어요.";
    }
    if (sdkStatus === "failed") {
      return "Kakao Maps SDK를 불러오지 못했어요. 네트워크와 JavaScript Key 설정을 확인해 주세요.";
    }
    return "";
  }, [sdkStatus]);

  const isMapReady = sdkStatus === "ready" && Boolean(kakao);
  const isSubmitDisabled = !isMapReady || isAddressLoading || !address;

  if (sdkStatus === "missing_key" || sdkStatus === "failed") {
    return (
      <section className="map-picker-fallback">
        <MapPin size={28} />
        <strong>지도를 연결할 준비가 필요해요.</strong>
        <p>{fallbackMessage}</p>
      </section>
    );
  }

  return (
    <section className="kakao-location-picker">
      <div className="map-control-row">
        <label className="radius-select">
          <span>반경</span>
          <select
            value={radiusMeters}
            onChange={(event) => {
              setRadiusMeters(Number(event.target.value) as SearchRadiusMeters);
              setSubmitError("");
            }}
          >
            <option value="">반경 설정</option>
            {radiusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button className="secondary-action-button" onClick={() => moveToCurrentLocation()}>
          <LocateFixed size={18} />
          현재 위치로 이동
        </button>
      </div>

      {geoError && <p className="map-error-message">{geoError}</p>}
      {submitError && <p className="map-error-message">{submitError}</p>}

      {sdkStatus === "loading" || !kakao ? (
        <div className="kakao-map-skeleton">지도를 불러오고 있어요.</div>
      ) : (
        <KakaoMapCanvas
          kakao={kakao}
          selectedCoordinates={selectedCoordinates}
          onSelectCoordinates={setSelectedCoordinates}
          onAddressChange={handleAddressChange}
        />
      )}

      {addressError && <p className="map-error-message">{addressError}</p>}

      <ManualLocationPanel
        isAddressLoading={isAddressLoading}
        onSubmit={handleSubmit}
        isSubmitDisabled={isSubmitDisabled}
      />
    </section>
  );
}
