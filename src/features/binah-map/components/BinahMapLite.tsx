'use client';

/**
 * BinahMapLite — 대시보드용 경량 세계지도
 * D3 equirectangular 투영으로 이벤트 마커를 SVG에 렌더링
 * topojson 불필요 — 마커 + 격자선만 표시
 */
import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import type { GeoEvent } from '../types';

interface Props {
  events: GeoEvent[];
  selectedId?: string | null;
  onSelect?: (event: GeoEvent) => void;
  /** SVG 높이 (기본 200px) */
  height?: number;
}

/** riskScore → 색상 */
function riskColor(score: number): string {
  if (score >= 70) return '#F87171'; // red-400
  if (score >= 45) return '#FBBF24'; // amber-400
  return '#34D399';                  // emerald-400
}

/** 경도 → SVG X (equirectangular) */
function lonToX(lon: number, w: number) {
  return ((lon + 180) / 360) * w;
}

/** 위도 → SVG Y */
function latToY(lat: number, h: number) {
  return ((90 - lat) / 180) * h;
}

export function BinahMapLite({ events, selectedId, onSelect, height = 200 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svg) return;

    const w = svgRef.current!.clientWidth || 400;
    const h = height;

    svg.attr('viewBox', `0 0 ${w} ${h}`);

    /* 배경 */
    svg.selectAll('.bg-rect').data([null]).join('rect')
      .attr('class', 'bg-rect')
      .attr('width', w).attr('height', h)
      .attr('fill', '#0F1923');

    /* 위도선 */
    const lats = [-60, -30, 0, 30, 60];
    svg.selectAll<SVGLineElement, number>('.lat-line')
      .data(lats)
      .join('line')
      .attr('class', 'lat-line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', (d) => latToY(d, h))
      .attr('y2', (d) => latToY(d, h))
      .attr('stroke', '#1E3448')
      .attr('stroke-width', 0.5);

    /* 경도선 */
    const lons = [-120, -60, 0, 60, 120];
    svg.selectAll<SVGLineElement, number>('.lon-line')
      .data(lons)
      .join('line')
      .attr('class', 'lon-line')
      .attr('x1', (d) => lonToX(d, w)).attr('x2', (d) => lonToX(d, w))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', '#1E3448')
      .attr('stroke-width', 0.5);

    /* 이벤트 마커 — ping group으로 교체 */
    const markerGroup = svg.selectAll<SVGGElement, GeoEvent>('.event-marker')
      .data(events, (d) => d.id)
      .join('g')
      .attr('class', 'event-marker');

    /* ping ring (map-ping-ring 클래스만 — 애니메이션은 globals.css에 정의) */
    markerGroup.selectAll<SVGCircleElement, GeoEvent>('.ping-ring')
      .data((d) => [d])
      .join('circle')
      .attr('class', 'ping-ring map-ping-ring')
      .attr('r', 7)
      .attr('cx', (d) => lonToX(d.lon, w))
      .attr('cy', (d) => latToY(d.lat, h))
      .attr('fill', 'none')
      .attr('stroke', (d) => riskColor(d.riskScore))
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6);

    /* core dot */
    markerGroup.selectAll<SVGCircleElement, GeoEvent>('.ping-core')
      .data((d) => [d])
      .join('circle')
      .attr('class', 'ping-core')
      .attr('r', 4)
      .attr('cx', (d) => lonToX(d.lon, w))
      .attr('cy', (d) => latToY(d.lat, h))
      .attr('fill', (d) => riskColor(d.riskScore))
      .attr('cursor', 'pointer')
      .on('click', (_evt, d) => onSelect?.(d));

    /* 선택 이벤트 — 라벨 */
    const selected = events.find((e) => e.id === selectedId);
    svg.selectAll('.marker-label').remove();
    if (selected) {
      const cx = lonToX(selected.lon, w);
      const cy = latToY(selected.lat, h);
      const txtX = cx + 10;
      const txtY = Math.max(cy - 8, 12);

      svg.append('text')
        .attr('class', 'marker-label')
        .attr('x', txtX)
        .attr('y', txtY)
        .attr('fill', '#E2E8F0')
        .attr('font-size', 10)
        .attr('pointer-events', 'none')
        .text(selected.region);
    }
  }, [events, selectedId, onSelect, height]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <svg
      ref={svgRef}
      className="w-full rounded-lg"
      style={{ height }}
    />
  );
}
