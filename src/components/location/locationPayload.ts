import type { Coordinates, ManualMapLocation } from "../../types";

type ManualMapLocationInput = {
  coordinates: Coordinates;
  address: string;
  detailAddress: string;
};

export function createManualMapLocation({
  coordinates,
  address,
  detailAddress,
}: ManualMapLocationInput): ManualMapLocation {
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    address,
    detailAddress,
    source: "manual_map",
    provider: "kakao",
  };
}

export async function submitManualMapLocation(location: ManualMapLocation) {
  // Backend API가 붙으면 이 함수 안에서 fetch("/api/locations", ...)로 교체하면 됩니다.
  console.info("manual_map_location_payload", location);
  return location;
}
