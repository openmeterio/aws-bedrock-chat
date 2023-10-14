'use client'

import { useMemo } from 'react'
import { useAsync, useIntervalEffect, useMountEffect } from '@react-hookz/web'
import { Chart } from '@/components/ui/chart'

export function UsageChart() {
  const [{ result }, { execute }] = useAsync(async () =>
    fetch('/api/usage?windowSize=MINUTE').then((res) => res.json()),
  )
  useMountEffect(execute)
  useIntervalEffect(execute, 5000)

  const options = useMemo<React.ComponentProps<typeof Chart>['option']>(
    () => ({
      xAxis: {
        type: 'time',
        min: 'dataMin',
        max: 'dataMax',
      },
      yAxis: {
        type: 'value',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false,
        },
      },
      series: [
        {
          id: 'total_tokens',
          datasetId: 'total_tokens',
          name: 'Total Tokens',
          type: 'bar',
          barMaxWidth: 5,
          encode: {
            x: 'windowStart',
            y: 'value',
            label: ['value'],
          },
        },
      ],
      dataset: [
        {
          id: 'total_tokens',
          source: result?.data ?? [],
          dimensions: ['windowStart', 'value'],
        },
      ],
    }),
    [result],
  )

  return (
    <div className="relative h-48 w-full">
      <Chart option={options} />
    </div>
  )
}
