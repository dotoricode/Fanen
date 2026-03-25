'use client';

/**
 * BinahMapLite — 대시보드용 경량 세계지도
 * topojson으로 세계 지도 실루엣 렌더링 + 이벤트 마커 + 툴팁
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
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

/** GeoJSON → SVG path 문자열 배열 변환 */
function geoFeatureToSvgPaths(
  geojson: {
    type: string;
    features: Array<{
      geometry: {
        type: string;
        coordinates: number[][][] | number[][][][];
      };
    }>;
  },
  w: number,
  h: number
): string[] {
  const paths: string[] = [];
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    const polygons =
      geom.type === 'Polygon'
        ? [geom.coordinates as number[][][]]
        : geom.type === 'MultiPolygon'
        ? (geom.coordinates as number[][][][])
        : [];
    for (const polygon of polygons) {
      let d = '';
      for (const ring of polygon) {
        if (ring.length < 2) continue;
        d +=
          ring
            .map((pt, i) => {
              const x = ((pt[0] + 180) / 360) * w;
              const y = ((90 - pt[1]) / 180) * h;
              return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            })
            .join(' ') + 'Z ';
      }
      if (d) paths.push(d.trim());
    }
  }
  return paths;
}

export function BinahMapLite({ events, selectedId, onSelect, height = 200 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldPaths, setWorldPaths] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    summary: string;
  } | null>(null);
  const [svgSize, setSvgSize] = useState({ w: 400, h: height });

  /* 세계 지도 데이터 로드 */
  useEffect(() => {
    fetch('/world-110m.json')
      .then((res) => res.json())
      .then((topo) => {
        const w = svgRef.current?.clientWidth || 400;
        const h = height;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geojson = topojson.feature(topo, topo.objects.countries) as any;
        const paths = geoFeatureToSvgPaths(geojson, w, h);
        setWorldPaths(paths);
      })
      .catch(() => {
        // 로드 실패 시 빈 배열 유지
      });
  }, [height]);

  const draw = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const w = svgRef.current.clientWidth || 400;
    const h = height;

    setSvgSize({ w, h });
    svg.attr('viewBox', `0 0 ${w} ${h}`);

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
    >
      {/* 배경 — 최하단 레이어 (D3 렌더링보다 먼저 위치해야 함) */}
      <rect width="100%" height={svgSize.h} fill="#0F1923" />

      {/* 세계 지도 실루엣 — 배경 위, 핀 아래 레이어 */}
      {worldPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          className="fill-zinc-200 stroke-zinc-300 dark:fill-zinc-800/50 dark:stroke-zinc-700"
          strokeWidth={0.3}
          fillRule="evenodd"
        />
      ))}

      {/* 이벤트 핀 — React로 렌더링 (d3 마커 위에 오버레이) */}
      {events.map((event) => {
        const pinX = lonToX(event.lon, svgSize.w);
        const pinY = latToY(event.lat, svgSize.h);
        return (
          <circle
            key={`pin-hover-${event.id}`}
            cx={pinX}
            cy={pinY}
            r={6}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => {
              setTooltip({
                x: pinX + 8,
                y: pinY - 8,
                title: event.title,
                summary: event.summary || '',
              });
            }}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => onSelect?.(event)}
          />
        );
      })}

      {/* 툴팁 — 최상단 레이어 */}
      {tooltip && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={tooltip.x}
            y={tooltip.y - 28}
            width={160}
            height={tooltip.summary ? 44 : 22}
            rx={4}
            className="fill-zinc-900/90 dark:fill-zinc-100/90"
          />
          <text
            x={tooltip.x + 8}
            y={tooltip.y - 12}
            fontSize={10}
            fontWeight={700}
            className="fill-white dark:fill-zinc-900"
          >
            {tooltip.title}
          </text>
          {tooltip.summary && (
            <text
              x={tooltip.x + 8}
              y={tooltip.y + 2}
              fontSize={9}
              className="fill-zinc-300 dark:fill-zinc-600"
            >
              {tooltip.summary.slice(0, 38)}
              {tooltip.summary.length > 38 ? '…' : ''}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
