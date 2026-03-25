'use client';

/**
 * BinahMapLite — 평면 / 3D 지구본 토글 세계지도
 *
 * FLAT 모드: geoNaturalEarth1, 대한민국 중앙, 대륙 라벨, 핑 클릭 시 줌인
 * 3D   모드: geoOrthographic, 드래그 회전, 핑 클릭 시 해당 위치로 스무스 애니메이션
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { GeoEvent } from '../types';

const EVENT_TYPE_KO: Record<string, string> = {
  trade:    '무역/기술',
  conflict: '지정학/갈등',
  policy:   '정책/규제',
  disaster: '재해/자연',
};
const EVENT_TYPE_COLOR: Record<string, string> = {
  trade:    'text-teal-600 dark:text-teal-400',
  conflict: 'text-rose-600 dark:text-rose-400',
  policy:   'text-amber-600 dark:text-amber-400',
  disaster: 'text-rose-700 dark:text-rose-500',
};

interface Props {
  events: GeoEvent[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (event: GeoEvent) => void;
  height?: number;
}

type ViewMode = 'flat' | '3d';
type Rotation = [number, number];

/* ── 색상 유틸 ── */
const riskColor = (s: number) => s >= 70 ? '#FB7185' : s >= 45 ? '#FBBF24' : '#2DD4BF';
const riskGlow  = (s: number) => s >= 70 ? 'rgba(251,113,133,0.45)' : s >= 45 ? 'rgba(251,191,36,0.45)' : 'rgba(45,212,191,0.45)';

/* 각도 정규화 (-180 ~ 180) */
const normAngle = (a: number) => ((a % 360) + 540) % 360 - 180;

/* easeInOutCubic */
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const SENSITIVITY  = 0.28;
const ANIM_DURATION = 900; // ms
const FLAT_ZOOM_SCALE = 2.8;

/* 대륙 라벨 기준 좌표 */
const CONTINENT_LABELS = [
  { text: 'N. AMERICA', lon: -100, lat: 48 },
  { text: 'S. AMERICA', lon: -58,  lat: -18 },
  { text: 'EUROPE',     lon: 15,   lat: 56 },
  { text: 'AFRICA',     lon: 22,   lat: 3 },
  { text: 'ASIA',       lon: 90,   lat: 50 },
  { text: 'OCEANIA',    lon: 134,  lat: -28 },
];
const LAT_TICKS = [
  { lat: 60, text: '60°N' }, { lat: 30, text: '30°N' },
  { lat: 0,  text: '0°'   }, { lat: -30, text: '30°S' }, { lat: -60, text: '60°S' },
];

export function BinahMapLite({ events, selectedId, hoveredId, onSelect, height = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize]         = useState({ w: 600, h: height });
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [landFeatures, setLandFeatures] = useState<d3.GeoPermissibleObjects[]>([]);
  const [tooltip, setTooltip]   = useState<{ x: number; y: number; title: string } | null>(null);

  /* 평면 줌 상태 — tx/ty: translate, scale */
  const [flatZoom, setFlatZoom] = useState({ tx: 0, ty: 0, scale: 1 });
  const flatZoomed = flatZoom.scale > 1;

  /* 3D 회전 상태 */
  const rotRef   = useRef<Rotation>([-127, -37]);
  const [rotation, setRotation] = useState<Rotation>([-127, -37]);
  const setRot = useCallback((r: Rotation) => { rotRef.current = r; setRotation(r); }, []);

  /* 드래그 */
  const dragRef  = useRef<{ sx: number; sy: number; sr: Rotation } | null>(null);
  const movedRef = useRef(false);

  /* 애니메이션 */
  const animRef  = useRef<number | null>(null);

  /* 클릭 알림 */
  const [notification, setNotification] = useState<GeoEvent | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((event: GeoEvent) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotification(event);
    notifTimer.current = setTimeout(() => setNotification(null), 3200);
  }, []);

  useEffect(() => () => { if (notifTimer.current) clearTimeout(notifTimer.current); }, []);

  /* 뷰 모드 전환 시 평면 줌 초기화 */
  useEffect(() => {
    if (viewMode === '3d') setFlatZoom({ tx: 0, ty: 0, scale: 1 });
  }, [viewMode]);

  /* ── 토포 데이터 로드 ── */
  useEffect(() => {
    fetch('/world-110m.json')
      .then(r => r.json())
      .then(topo => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geo = topojson.feature(topo as any, (topo as any).objects.countries) as any;
        setLandFeatures(geo.features);
      })
      .catch(() => {});
  }, []);

  /* ── ResizeObserver ── */
  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current)
        setSize({ w: containerRef.current.clientWidth || 600, h: height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  /* ── 스무스 3D 회전 애니메이션 ── */
  const animateTo = useCallback((target: Rotation) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start: Rotation = [...rotRef.current];
    const dLon = normAngle(target[0] - start[0]);
    const dLat = target[1] - start[1];
    const t0 = performance.now();

    const step = (now: number) => {
      const p = Math.min((now - t0) / ANIM_DURATION, 1);
      const e = ease(p);
      setRot([start[0] + dLon * e, start[1] + dLat * e]);
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, [setRot]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  /* ── 마우스 드래그 (3D 전용) ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (viewMode !== '3d') return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    movedRef.current = false;
    dragRef.current = { sx: e.clientX, sy: e.clientY, sr: [...rotRef.current] };
  }, [viewMode]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true;
    setRot([
      dragRef.current.sr[0] + dx * SENSITIVITY,
      Math.max(-85, Math.min(85, dragRef.current.sr[1] - dy * SENSITIVITY)),
    ]);
  }, [setRot]);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  /* ── 터치 드래그 ── */
  const touchRef = useRef<{ sx: number; sy: number; sr: Rotation } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (viewMode !== '3d') return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const t = e.touches[0];
    touchRef.current = { sx: t.clientX, sy: t.clientY, sr: [...rotRef.current] };
  }, [viewMode]);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = e.touches[0];
    setRot([
      touchRef.current.sr[0] + (t.clientX - touchRef.current.sx) * SENSITIVITY,
      Math.max(-85, Math.min(85, touchRef.current.sr[1] - (t.clientY - touchRef.current.sy) * SENSITIVITY)),
    ]);
  }, [setRot]);
  const onTouchEnd = useCallback(() => { touchRef.current = null; }, []);

  /* ── 마커 클릭: 3D → 회전, FLAT → 줌인 ── */
  const { w, h } = size;

  const handleMarkerClick = useCallback((event: GeoEvent, mx?: number, my?: number) => {
    if (movedRef.current) return;
    onSelect?.(event);
    showNotification(event);
    if (viewMode === '3d') {
      animateTo([-event.lon, -event.lat]);
    } else if (mx !== undefined && my !== undefined) {
      setFlatZoom({
        scale: FLAT_ZOOM_SCALE,
        tx: w / 2 - mx * FLAT_ZOOM_SCALE,
        ty: h / 2 - my * FLAT_ZOOM_SCALE,
      });
    }
  }, [viewMode, onSelect, animateTo, showNotification, w, h]);

  /* ── 평면 줌 리셋 ── */
  const resetFlatZoom = useCallback(() => {
    setFlatZoom({ tx: 0, ty: 0, scale: 1 });
  }, []);

  /* ── 투영 계산 ── */
  const radius = Math.min(w, h) / 2 - 10;
  const cx = w / 2;
  const cy = h / 2;

  const proj = viewMode === '3d'
    ? d3.geoOrthographic().rotate(rotation).scale(radius).translate([cx, cy]).clipAngle(90)
    : d3.geoNaturalEarth1().rotate([-127, 0]).scale(w / (2 * Math.PI) * 1.05).translate([cx, cy + h * 0.04]);

  const pathGen = d3.geoPath().projection(proj);

  const spherePath    = viewMode === '3d' ? (pathGen({ type: 'Sphere' }) ?? '') : '';
  const graticulePath = pathGen(d3.geoGraticule().step([30, 30])()) ?? '';

  const landPaths = landFeatures
    .map(f => pathGen(f))
    .filter((d): d is string => !!d);

  /* 마커 위치 */
  const markerPositions = events.map(ev => {
    const c = proj([ev.lon, ev.lat]);
    if (!c) return null;
    if (viewMode === '3d' && Math.hypot(c[0] - cx, c[1] - cy) > radius + 1) return null;
    return { id: ev.id, x: c[0], y: c[1], event: ev };
  }).filter(Boolean) as { id: string; x: number; y: number; event: GeoEvent }[];

  /* 평면 모드 라벨 */
  const continentLabels = viewMode === 'flat'
    ? CONTINENT_LABELS.map(({ text, lon, lat }) => {
        const c = proj([lon, lat]);
        return c ? { x: c[0], y: c[1], text } : null;
      }).filter(Boolean) as { x: number; y: number; text: string }[]
    : [];

  const latLabels = viewMode === 'flat'
    ? LAT_TICKS.map(({ lat, text }) => {
        const c = proj([-48, lat]);
        return c ? { x: c[0], y: c[1], text } : null;
      }).filter(Boolean) as { x: number; y: number; text: string }[]
    : [];

  const is3D = viewMode === '3d';
  const isDraggingNow = !!dragRef.current;

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{
        height: is3D ? height + 28 : height,
        cursor: is3D
          ? (isDraggingNow ? 'grabbing' : 'grab')
          : flatZoomed ? 'zoom-out' : 'default',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── 평면/3D 토글 + 줌 리셋 버튼 ── */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* 줌 리셋 버튼 — 평면 줌인 상태에서만 표시 */}
        <AnimatePresence>
          {!is3D && flatZoomed && (
            <motion.button
              key="zoom-reset"
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              onClick={resetFlatZoom}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 shadow-sm transition-colors"
              title="지도 축소"
            >
              <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx={7} cy={7} r={5} />
                <path d="M5 7h4M12.5 12.5l-2-2" />
              </svg>
              축소
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
          {(['flat', '3d'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={[
                'px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase transition-colors',
                viewMode === mode
                  ? 'bg-zinc-800 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900'
                  : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
              ].join(' ')}
            >
              {mode === 'flat' ? 'FLAT' : '3D'}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height, display: 'block', overflow: 'hidden' }}
      >
        <defs>
          <radialGradient id="globe-atmo" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="rgba(45,212,191,0)" />
            <stop offset="100%" stopColor="rgba(45,212,191,0.13)" />
          </radialGradient>
          <radialGradient id="globe-depth" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </radialGradient>
          <filter id="marker-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="map-clip">
            <rect width={w} height={h} />
          </clipPath>
        </defs>

        {/* ── 전체 맵 콘텐츠: 평면 줌 transform 적용 ── */}
        <motion.g
          clipPath="url(#map-clip)"
          animate={
            !is3D
              ? { x: flatZoom.tx, y: flatZoom.ty, scale: flatZoom.scale }
              : { x: 0, y: 0, scale: 1 }
          }
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ originX: 0, originY: 0 }}
        >
          {/* ── 배경 ── */}
          <rect width={w} height={h} style={{ fill: 'var(--map-bg)' }} />

          {/* ── 3D: 구 본체 ── */}
          {is3D && <path d={spherePath} style={{ fill: 'var(--globe-fill)' }} />}
          {is3D && <path d={spherePath} fill="url(#globe-depth)" pointerEvents="none" />}

          {/* ── 경위선 그리드 ── */}
          <path d={graticulePath} fill="none" style={{ stroke: 'var(--map-grid)' }} strokeWidth={0.4} />

          {/* ── 대륙 ── */}
          {landPaths.map((d, i) => (
            <path
              key={i} d={d}
              style={{ fill: 'var(--map-continent-fill)', stroke: 'var(--map-continent-stroke)' }}
              strokeWidth={0.5} strokeLinejoin="round"
            />
          ))}

          {/* ── 3D: 대기권 글로우 + 외곽선 ── */}
          {is3D && <path d={spherePath} fill="url(#globe-atmo)" pointerEvents="none" />}
          {is3D && (
            <path d={spherePath} fill="none"
              style={{ stroke: 'var(--globe-border)' }} strokeWidth={0.8} />
          )}

          {/* ── FLAT: 대륙 라벨 ── */}
          {continentLabels.map(({ x, y, text }) => (
            <text key={text} x={x} y={y} textAnchor="middle"
              fontSize={8} fontFamily="monospace" fontWeight={600}
              style={{ fill: 'var(--map-continent-label)', pointerEvents: 'none' }}
              letterSpacing="0.12em"
            >
              {text}
            </text>
          ))}

          {/* ── FLAT: 위도 눈금 ── */}
          {latLabels.map(({ x, y, text }) => (
            <text key={text} x={x + 3} y={y + 3}
              fontSize={7} fontFamily="monospace"
              style={{ fill: 'var(--map-lat-label)', pointerEvents: 'none' }}
              letterSpacing="0.04em"
            >
              {text}
            </text>
          ))}

          {/* ── 이벤트 마커 ── */}
          {markerPositions.map(({ id, x, y, event }) => {
            const color = riskColor(event.riskScore);
            const glow  = riskGlow(event.riskScore);
            const hl    = id === selectedId || id === hoveredId;

            return (
              <g key={id} style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(event, x, y);
                }}
              >
                <circle cx={x} cy={y} r={hl ? 20 : 12} fill={glow}
                  style={{ filter: 'blur(7px)', transition: 'r 0.25s ease' }} />
                <circle cx={x} cy={y} r={hl ? 9 : 6} fill="none"
                  stroke={color} strokeWidth={hl ? 1.5 : 1} className="map-pulse-1" />
                <circle cx={x} cy={y} r={hl ? 9 : 6} fill="none"
                  stroke={color} strokeWidth={0.8} className="map-pulse-2" />
                <circle cx={x} cy={y} r={hl ? 5.5 : 3.5} fill={color} opacity={0.95}
                  filter="url(#marker-glow)"
                  style={{ transition: 'r 0.2s ease' }} />
                <circle cx={x} cy={y} r={14} fill="transparent"
                  onMouseEnter={() => setTooltip({ x, y, title: event.title })}
                  onMouseLeave={() => setTooltip(null)} />
              </g>
            );
          })}

          {/* ── 툴팁 ── */}
          {tooltip && (
            <g pointerEvents="none">
              <rect x={tooltip.x + 12} y={tooltip.y - 30} width={172} height={22} rx={4}
                fill="rgba(9,9,11,0.92)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
              <text x={tooltip.x + 20} y={tooltip.y - 14}
                fontSize={10} fontWeight={600} fill="rgba(255,255,255,0.9)">
                {tooltip.title}
              </text>
            </g>
          )}
        </motion.g>

        {/* ── 평면 줌인 상태: 배경 클릭으로 리셋 (맵 위에 투명 레이어) ── */}
        {!is3D && flatZoomed && (
          <rect
            width={w} height={h} fill="transparent"
            onClick={resetFlatZoom}
            style={{ cursor: 'zoom-out' }}
          />
        )}
      </svg>

      {/* ── 클릭 알림 (Framer Motion) ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 shadow-lg
              bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md
              border border-zinc-200 dark:border-zinc-700"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: riskColor(notification.riskScore) }}
              />
              <span className={`text-[10px] font-bold tracking-widest shrink-0 ${EVENT_TYPE_COLOR[notification.eventType] ?? 'text-zinc-500'}`}>
                {EVENT_TYPE_KO[notification.eventType] ?? notification.eventType.toUpperCase()}
              </span>
              <span className="w-px h-3 bg-zinc-200 dark:bg-zinc-700 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 leading-tight truncate max-w-[200px]">
                  {notification.title}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {notification.region}
                </p>
              </div>
              <span
                className="text-xs font-bold tabular-nums shrink-0"
                style={{ color: riskColor(notification.riskScore) }}
              >
                {notification.riskScore}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D 조작 힌트 바 ── */}
      {is3D && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 py-2 pointer-events-none">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="5.5" />
              <path d="M5.5 2.5c0 3 5 3 5 6" />
              <path d="M10.5 13.5c0-3-5-3-5-6" />
            </svg>
            드래그로 회전
          </span>
          <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="7" r="2.5" />
              <path strokeLinecap="round" d="M8 9.5V13" />
              <path strokeLinecap="round" d="M6 11.5h4" />
            </svg>
            핑 클릭 → 해당 위치로 이동
          </span>
        </div>
      )}

      {/* ── FLAT 모드 힌트 ── */}
      {!is3D && !flatZoomed && (
        <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx={7} cy={7} r={4} />
              <path d="M5 7h4M12 12l-2.5-2.5" />
              <path d="M10.5 12l1.5 0M12 10.5v1.5" />
            </svg>
            핑 클릭 → 확대
          </span>
        </div>
      )}
    </div>
  );
}
