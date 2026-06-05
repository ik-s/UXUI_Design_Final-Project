import type { Coordinates, SearchRadiusMeters } from "../types";

export type MedicalFacility = Coordinates & {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress?: string;
  openStatus?: "open" | "closed";
  closesAt?: string;
  opensAt?: string;
  phone: string;
  placeUrl?: string;
  type?: "hospital" | "pharmacy" | "keyword";
};

export const medicalFacilities: MedicalFacility[] = [
  {
    id: "seoul-bontentn",
    name: "서울본튼튼정형외과의원",
    category: "의원",
    address: "서울 광진구 군자로 73",
    latitude: 37.54895,
    longitude: 127.07135,
    openStatus: "open",
    closesAt: "19:00",
    phone: "02-000-1188",
  },
  {
    id: "jangwi-365",
    name: "장위365경희한의원",
    category: "의원",
    address: "서울 성북구 화랑로 245",
    latitude: 37.5414,
    longitude: 127.0668,
    openStatus: "open",
    closesAt: "20:30",
    phone: "02-000-3650",
  },
  {
    id: "beauty-on",
    name: "뷰티온의원 돌곶이역점",
    category: "의원",
    address: "서울 성북구 돌곶이로 101",
    latitude: 37.53895,
    longitude: 127.06435,
    openStatus: "closed",
    closesAt: "18:00",
    opensAt: "09:30",
    phone: "02-000-2020",
  },
  {
    id: "seoul-dabar",
    name: "서울더바른치과교정과치과의원",
    category: "병원",
    address: "서울 광진구 동일로 152",
    latitude: 37.54025,
    longitude: 127.0722,
    openStatus: "open",
    closesAt: "21:00",
    phone: "02-000-2875",
  },
  {
    id: "jangwi-health",
    name: "장위석관보건지소",
    category: "병원",
    address: "서울 성북구 한천로 568",
    latitude: 37.53725,
    longitude: 127.0708,
    openStatus: "closed",
    closesAt: "17:30",
    opensAt: "09:00",
    phone: "02-000-9000",
  },
  {
    id: "gongreung-dental",
    name: "공릉온치과의원",
    category: "의원",
    address: "서울 노원구 동일로 1010",
    latitude: 37.5508,
    longitude: 127.08065,
    openStatus: "open",
    closesAt: "18:30",
    phone: "02-000-7528",
  },
  {
    id: "morning-pharmacy",
    name: "화양시장약국",
    category: "약국",
    address: "서울 광진구 능동로 18",
    latitude: 37.54335,
    longitude: 127.0691,
    openStatus: "open",
    closesAt: "22:00",
    phone: "02-000-0700",
  },
  {
    id: "children-clinic",
    name: "어린이대공원소아청소년과",
    category: "의원",
    address: "서울 광진구 능동로 216",
    latitude: 37.55145,
    longitude: 127.0768,
    openStatus: "open",
    closesAt: "19:30",
    phone: "02-000-5511",
  },
];

export function getDistanceMeters(origin: Coordinates, target: Coordinates) {
  const earthRadius = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(target.latitude - origin.latitude);
  const dLng = toRadians(target.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const targetLat = toRadians(target.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(dLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getFacilitiesInRadius(origin: Coordinates, radiusMeters: SearchRadiusMeters) {
  return medicalFacilities
    .map((facility) => ({
      ...facility,
      distanceMeters: Math.round(getDistanceMeters(origin, facility)),
    }))
    .filter((facility) => facility.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
