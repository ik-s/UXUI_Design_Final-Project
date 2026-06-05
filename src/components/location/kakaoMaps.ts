import type { Coordinates } from "../../types";

export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMap = {
  setCenter: (latLng: KakaoLatLng) => void;
  relayout: () => void;
};

export type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (latLng: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
};

export type KakaoCircle = {
  setMap: (map: KakaoMap | null) => void;
};

export type KakaoCustomOverlay = {
  setMap: (map: KakaoMap | null) => void;
};

type KakaoAddressResult = {
  address?: {
    address_name?: string;
    region_2depth_name?: string;
    region_3depth_name?: string;
  };
  road_address?: {
    address_name?: string;
  } | null;
};

export type KakaoPlaceResult = {
  id?: string;
  place_name?: string;
  category_name?: string;
  address_name?: string;
  road_address_name?: string;
  phone?: string;
  distance?: string;
  x?: string;
  y?: string;
  place_url?: string;
};

export type KakaoPlacesSearchOptions = {
  location: KakaoLatLng;
  radius: number;
  sort?: string;
};

export type KakaoNamespace = {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number },
    ) => KakaoMap;
    Marker: new (options: {
      map: KakaoMap;
      position: KakaoLatLng;
      draggable?: boolean;
    }) => KakaoMarker;
    Circle: new (options: {
      center: KakaoLatLng;
      radius: number;
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      fillColor?: string;
      fillOpacity?: number;
    }) => KakaoCircle;
    CustomOverlay: new (options: {
      map?: KakaoMap;
      position: KakaoLatLng;
      content: HTMLElement | string;
      yAnchor?: number;
      zIndex?: number;
    }) => KakaoCustomOverlay;
    event: {
      addListener: (
        target: unknown,
        eventName: string,
        callback: (event: { latLng: KakaoLatLng }) => void,
      ) => void;
    };
    services: {
      Status: {
        OK: string;
        ZERO_RESULT?: string;
      };
      SortBy: {
        DISTANCE: string;
      };
      Geocoder: new () => {
        coord2Address: (
          longitude: number,
          latitude: number,
          callback: (result: KakaoAddressResult[], status: string) => void,
        ) => void;
      };
      Places: new () => {
        categorySearch: (
          code: string,
          callback: (result: KakaoPlaceResult[], status: string) => void,
          options: KakaoPlacesSearchOptions,
        ) => void;
        keywordSearch: (
          keyword: string,
          callback: (result: KakaoPlaceResult[], status: string) => void,
          options: KakaoPlacesSearchOptions,
        ) => void;
      };
    };
  };
};

declare global {
  interface Window {
    kakao?: KakaoNamespace;
  }
}

let kakaoMapsPromise: Promise<KakaoNamespace> | null = null;

export function loadKakaoMapsSdk(apiKey: string): Promise<KakaoNamespace> {
  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      window.kakao?.maps.load(() => resolve(window.kakao as KakaoNamespace));
    });
  }

  if (kakaoMapsPromise) return kakaoMapsPromise;

  kakaoMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      appkey: apiKey,
      autoload: "false",
      libraries: "services",
    });

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK is not available after load."));
        return;
      }

      window.kakao.maps.load(() => resolve(window.kakao as KakaoNamespace));
    };
    script.onerror = () => reject(new Error("Kakao Maps SDK failed to load."));

    document.head.appendChild(script);
  });

  return kakaoMapsPromise;
}

export function toLatLng(kakao: KakaoNamespace, coordinates: Coordinates) {
  return new kakao.maps.LatLng(coordinates.latitude, coordinates.longitude);
}

export function toCoordinates(latLng: KakaoLatLng): Coordinates {
  return {
    latitude: latLng.getLat(),
    longitude: latLng.getLng(),
  };
}

export function pickAddress(result: KakaoAddressResult[]) {
  const first = result[0];
  return first?.road_address?.address_name ?? first?.address?.address_name ?? "";
}

export function pickNeighborhood(result: KakaoAddressResult[]) {
  const address = result[0]?.address;
  const gu = address?.region_2depth_name?.trim();
  const dong = address?.region_3depth_name?.trim();

  if (gu && dong) return `${gu} ${dong}`;
  return "";
}
