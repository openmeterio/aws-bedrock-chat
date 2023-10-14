'use client'

import { useEffect, useRef } from 'react'
import { useResizeObserver } from '@react-hookz/web'
import { BarChart, BarSeriesOption } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import { cn } from '@/lib/utils'

echarts.use([
  BarChart,
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
  LabelLayout,
  SVGRenderer,
  TooltipComponent,
  TransformComponent,
  UniversalTransition,
])

export type ChartOption = echarts.ComposeOption<
  | BarSeriesOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>

export interface ChartProps {
  option: ChartOption
  className?: string
}

const defaultOption: ChartOption = {
  grid: {
    top: '2.5%',
    left: '2.5%',
    right: '2.5%',
    bottom: '2.5%',
    containLabel: true,
  },
}

export function Chart({ option, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<echarts.ECharts>()
  useResizeObserver(chartRef, () => {
    chart.current?.resize()
  })

  useEffect(() => {
    const c = echarts.init(chartRef.current, null, { renderer: 'canvas' })
    c.setOption({ ...defaultOption, ...option })
    chart.current = c
    return () => {
      c.dispose()
      chart.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef])

  useEffect(() => {
    chart.current?.setOption({ ...defaultOption, ...option }, true)
  }, [option])

  return <div ref={chartRef} className={cn(`h-full w-full`, className)} />
}
