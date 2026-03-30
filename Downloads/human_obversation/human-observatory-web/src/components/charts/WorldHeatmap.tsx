// src/components/charts/WorldHeatmap.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'
import { ALPHA2_TO_NUMERIC, NUMERIC_TO_NAME } from '@/lib/countryCode'

interface WorldHeatmapProps {
  regionBreakdown: Record<string, Record<string, number>>  // { TW: { A: 72, B: 18 }, ... }
  userAnswer: string
  options: { key: string; label_zh: string }[]
}

const ANSWER_COLORS: Record<string, string[]> = {
  A: ['#0a1628', '#0d2a4a', '#0f3d6e', '#1255a0', '#1a6cc5', '#2485e0', '#3B82F6'],
  B: ['#0a1a12', '#0d2d1a', '#0f4024', '#117a35', '#159948', '#1ab85a', '#10B981'],
  C: ['#1a1200', '#2d1e00', '#4a2e00', '#7a4a00', '#b06400', '#d4820a', '#F59E0B'],
  D: ['#1a0a0a', '#2d0d0d', '#4a1010', '#7a1515', '#aa1c1c', '#cc2a2a', '#EF4444'],
  E: ['#120a1a', '#1e0d2d', '#2e1050', '#4a1880', '#6820b0', '#8030d0', '#8B5CF6'],
}

const NO_DATA_COLOR = '#1a2530'

function buildValueMap(
  regionBreakdown: Record<string, Record<string, number>>,
  option: string
): Map<number, number> {
  const valueMap = new Map<number, number>()
  Object.entries(regionBreakdown).forEach(([alpha2, dist]) => {
    const numericId = ALPHA2_TO_NUMERIC[alpha2]
    if (numericId !== undefined && dist[option] !== undefined) {
      const total = Object.values(dist).reduce((a, b) => a + b, 0)
      if (total > 0) {
        valueMap.set(numericId, Math.round((dist[option] / total) * 100))
      }
    }
  })
  return valueMap
}

function drawMap(
  svgEl: SVGSVGElement,
  world: Topology,
  valueMap: Map<number, number>,
  option: string,
  onHover: (c: { name: string; value: number } | null) => void
) {
  const W = svgEl.clientWidth || 600
  const H = Math.round(W * 0.52)

  const vals = [...valueMap.values()]
  const scheme = ANSWER_COLORS[option] ?? ANSWER_COLORS.A
  const color = d3.scaleQuantize(
    [0, vals.length ? Math.max(...vals) : 100],
    scheme
  )

  const svg = d3.select(svgEl)
    .attr('viewBox', `0 0 ${W} ${H}`)
    .style('height', `${H}px`)
  svg.selectAll('*').remove()

  const proj = d3.geoNaturalEarth1().scale(W / 6.4).translate([W / 2, H / 2])
  const pathGen = d3.geoPath(proj)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topoAny = world as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features = (topojson.feature(topoAny, topoAny.objects.countries) as any).features as Array<{
    id?: string | number
    type: string
    geometry: d3.GeoPermissibleObjects
    properties: Record<string, unknown>
  }>

  svg.append('g')
    .selectAll<SVGPathElement, (typeof features)[0]>('path')
    .data(features)
    .join('path')
    .attr('d', (f) => pathGen(f.geometry as d3.GeoPermissibleObjects) ?? '')
    .attr('fill', (f) => {
      const v = valueMap.get(+(f.id ?? -1))
      return v !== undefined ? color(v) : NO_DATA_COLOR
    })
    .attr('stroke', '#0D1620')
    .attr('stroke-width', 0.4)
    .on('mouseover touchstart', function (_, f) {
      const v = valueMap.get(+(f.id ?? -1))
      const name = NUMERIC_TO_NAME[+(f.id ?? -1)]
      if (v !== undefined && name) {
        d3.select(this).attr('stroke', '#0D9BAA').attr('stroke-width', 1.5)
        onHover({ name, value: v })
      }
    })
    .on('mouseout touchend', function () {
      d3.select(this).attr('stroke', '#0D1620').attr('stroke-width', 0.4)
      onHover(null)
    })
}

export function WorldHeatmap({ regionBreakdown, userAnswer, options }: WorldHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeOption, setActiveOption] = useState(userAnswer)
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; value: number } | null>(null)
  const [worldData, setWorldData] = useState<Topology | null>(null)

  // topology 只 fetch 一次
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then(setWorldData)
  }, [])

  // 每次 activeOption 或資料變更時重繪
  useEffect(() => {
    if (!worldData || !svgRef.current) return
    const valueMap = buildValueMap(regionBreakdown, activeOption)
    drawMap(svgRef.current, worldData, valueMap, activeOption, setHoveredCountry)
  }, [worldData, activeOption, regionBreakdown])

  const activeScheme = ANSWER_COLORS[activeOption] ?? ANSWER_COLORS.A

  return (
    <div>
      {/* 標題 */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
        各國選項分佈（顯示各國選此選項的比例 %）
      </div>

      {/* 選項切換按鈕 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const isActive = activeOption === opt.key
          const colorVar = `var(--answer-${opt.key.toLowerCase()})`
          return (
            <button
              key={opt.key}
              onClick={() => setActiveOption(opt.key)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: `1px solid ${isActive ? colorVar : 'var(--border)'}`,
                background: isActive ? `color-mix(in srgb, ${colorVar} 15%, transparent)` : 'transparent',
                color: isActive ? colorVar : 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {opt.key}
            </button>
          )
        })}
      </div>

      {/* D3 SVG 地圖 */}
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />

      {/* 色階圖例 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0%</span>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(to right, ${activeScheme[0]}, ${activeScheme[activeScheme.length - 1]})`,
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>100%</span>
      </div>

      {/* hover tooltip */}
      {hoveredCountry && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--text)',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{hoveredCountry.name}</span>
          {'　'}
          <span
            style={{
              fontWeight: 500,
              color: `var(--answer-${activeOption.toLowerCase()})`,
            }}
          >
            {hoveredCountry.value}%
          </span>
          {' 的人選了選項 '}
          {activeOption}
        </div>
      )}
    </div>
  )
}
