import type { LngLat, Marker } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { MapContext } from "./Map";

export type MarkerDragEvent = {
  type: 'dragstart' | 'drag' | 'dragend';
  target: Marker;
  lngLat: LngLat;
};

export type MarkerProps = {
  /** Longitude of the anchor location */
  longitude: number;
  /** Latitude of the anchor location */
  latitude: number;
  /** A boolean indicating whether or not a marker is able to be dragged to a new position on the map.
   * @default false
   */
  draggable: boolean;
  /** The offset in pixels as a PointLike object to apply relative to the element's center. Negatives indicate left and up. */
  /** CSS style override, applied to the control's container */
  // onClick?: (e: MapboxEvent<MouseEvent>) => void;
  onDragStart?: (e: MarkerDragEvent) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
  children?: React.ReactNode;
};

const defaultProps: Partial<MarkerProps> = {
  draggable: false
};

export function MyMarker (props: MarkerProps) {

  const {map} = useContext(MapContext);

  const thisRef = useRef({props});
  thisRef.current.props = props;

  const marker: Marker = useMemo<Marker>(() => {
    const mk = new maplibregl.Marker({color: "#FF0000"})
        .setLngLat([props.longitude,props.latitude])

    mk.on('dragend', e => {
      const evt = e as MarkerDragEvent;
      evt.lngLat = marker.getLngLat();
      thisRef.current.props.onDragEnd?.(evt);
    })

    return mk
  }, [])

  useEffect(() => {
    if (map) {
      marker.addTo(map);
    }

    return () => {
      marker.remove();
    };
  }, []);

  if (marker.getLngLat().lng !== props.longitude || marker.getLngLat().lat !== props.latitude) {
    marker.setLngLat([props.longitude, props.latitude]);
  }

  if (marker.isDraggable() !== props.draggable) {
    marker.setDraggable(props.draggable);
  }

  return createPortal(props.children, marker.getElement());
}

MyMarker.defaultProps = defaultProps;

export default React.memo(MyMarker);