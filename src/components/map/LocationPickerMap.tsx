import { CivicMap } from './CivicMap';

interface LocationPickerMapProps {
  coordinates: { lat: number; lng: number };
  onChangeCoordinates?: (coords: { lat: number; lng: number }) => void;
  height?: string;
  isDetecting?: boolean;
  addressLabel?: string;
}

export function LocationPickerMap({
  coordinates,
  onChangeCoordinates,
  height = '210px',
  isDetecting = false,
  addressLabel,
}: LocationPickerMapProps) {
  return (
    <CivicMap
      mode="picker"
      coordinates={coordinates}
      onChangeCoordinates={onChangeCoordinates}
      height={height}
      isDetecting={isDetecting}
      addressLabel={addressLabel}
    />
  );
}
