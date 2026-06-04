import { LocateFixed, MapPin, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  type SeoulNeighborhood,
  seoulNeighborhoods,
} from "../data/seoulNeighborhoods";

type LocationPageProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

type LocationStatus = {
  type: "idle" | "loading" | "found" | "error";
  message: string;
};

type LocationSource = "search" | "device" | "ip";

type Coordinates = {
  lat: number;
  lng: number;
};

type IpLocationResponse = {
  city?: string;
  country_code?: string;
  error?: boolean;
  latitude?: number;
  longitude?: number;
  reason?: string;
  region?: string;
};

export function LocationPage({ value, onChange, onNext }: LocationPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<SeoulNeighborhood | null>(null);
  const [status, setStatus] = useState<LocationStatus>({
    type: "idle",
    message: "동네 이름을 검색하거나 현재 위치로 찾아보세요.",
  });

  const results = useMemo(() => {
    const query = normalize(value);
    if (!query) return seoulNeighborhoods.slice(0, 6);

    return seoulNeighborhoods
      .filter((item) => {
        const label = normalize(`${item.gu} ${item.dong}`);
        return label.includes(query);
      })
      .slice(0, 8);
  }, [value]);

  const selectNeighborhood = (item: SeoulNeighborhood, source: LocationSource) => {
    setSelected(item);
    onChange(`${item.gu} ${item.dong}`);
    setStatus({
      type: "found",
      message: getFoundMessage(source),
    });
  };

  const handlePrimaryClick = () => {
    if (selected) {
      onNext();
      return;
    }

    void findCurrentNeighborhood(selectNeighborhood, setStatus);
  };

  const focusSearch = () => {
    inputRef.current?.focus();
    setStatus({
      type: "idle",
      message: "예: 화양동, 성수동, 마포구처럼 검색할 수 있어요.",
    });
  };

  return (
    <div className="location-screen">
      <label className="search-field">
        <Search size={20} />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setSelected(null);
          }}
          placeholder="내 동네 이름 (동,읍,면)으로 검색"
        />
      </label>

      <section className="location-results" aria-label="서울 동네 검색 결과">
        {results.map((item) => {
          const isSelected = selected?.gu === item.gu && selected.dong === item.dong;

          return (
            <button
              className={isSelected ? "selected" : ""}
              key={`${item.gu}-${item.dong}`}
              onClick={() => selectNeighborhood(item, "search")}
            >
              <MapPin size={18} />
              <span>
                <strong>{item.dong}</strong>
                <small>{item.gu} · 서울</small>
              </span>
            </button>
          );
        })}
      </section>

      <div className={`location-status location-status-${status.type}`}>
        <LocateFixed size={18} />
        <span>{status.message}</span>
      </div>

      {selected ? (
        <div className="selected-neighborhood">
          <strong>{selected.dong}</strong>
          <span>{selected.gu} · 서울특별시</span>
        </div>
      ) : (
        <div className="empty-location">
          <p>
            현재 위치로 동네를 받아오지 못했어요.
            <br />내 동네 이름으로 검색해보세요!
          </p>
          <button onClick={focusSearch}>내 동네 이름 검색하기</button>
        </div>
      )}

      <button
        className="primary-button"
        disabled={status.type === "loading"}
        onClick={handlePrimaryClick}
      >
        {selected
          ? "이 동네로 시작하기"
          : status.type === "loading"
            ? "현재 위치 확인 중"
            : "현재 위치로 찾기"}
      </button>
    </div>
  );
}

function normalize(value: string) {
  return value.replace(/\s/g, "").toLowerCase();
}

async function findCurrentNeighborhood(
  onFound: (item: SeoulNeighborhood, source: LocationSource) => void,
  setStatus: (status: LocationStatus) => void,
) {
  setStatus({ type: "loading", message: "브라우저 현재 위치를 확인하고 있어요." });

  try {
    const coords = await getBrowserCoordinates();
    onFound(findNearestNeighborhood(coords.lat, coords.lng), "device");
    return;
  } catch {
    setStatus({
      type: "loading",
      message: "위치 권한을 받을 수 없어 IP 기반 위치로 한 번 더 확인하고 있어요.",
    });
  }

  try {
    const coords = await getIpCoordinates();
    const nearest = findNearestNeighborhood(coords.lat, coords.lng);
    const distance = getDistance(coords.lat, coords.lng, nearest.lat, nearest.lng);

    if (distance > 80) {
      setStatus({
        type: "error",
        message: "외부 위치 정보가 서울과 멀어요. 동네 이름으로 직접 검색해주세요.",
      });
      return;
    }

    onFound(nearest, "ip");
  } catch {
    setStatus({
      type: "error",
      message: "현재 위치를 확인할 수 없어요. 동네 이름으로 직접 검색해주세요.",
    });
  }
}

function getFoundMessage(source: LocationSource) {
  if (source === "device") return "현재 위치와 가장 가까운 서울 동네를 찾았어요.";
  if (source === "ip") return "브라우저 위치 대신 IP 기반으로 가까운 서울 동네를 찾았어요.";
  return "선택한 동네를 확인했어요.";
}

function getBrowserCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation API is not available."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      reject,
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 },
    );
  });
}

async function getIpCoordinates(): Promise<Coordinates> {
  const response = await fetch("https://ipapi.co/json/");
  if (!response.ok) throw new Error("IP location API request failed.");

  const data = (await response.json()) as IpLocationResponse;
  if (data.error || typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error(data.reason ?? "IP location API returned invalid coordinates.");
  }

  return { lat: data.latitude, lng: data.longitude };
}

function findNearestNeighborhood(lat: number, lng: number) {
  return seoulNeighborhoods.reduce((nearest, item) => {
    const distance = getDistance(lat, lng, item.lat, item.lng);
    return distance < nearest.distance ? { item, distance } : nearest;
  }, { item: seoulNeighborhoods[0], distance: Number.POSITIVE_INFINITY }).item;
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
