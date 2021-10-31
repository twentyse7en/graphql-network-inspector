import { debounce } from "ts-debounce";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { nsToMs } from "../../helpers/nsToMs";

interface ITracingVizualizationRowProps {
  name?: string;
  type?: string;
  color?: 'green' | 'purple' | 'indigo';
  total: number;
  offset?: number;
  duration: number;
}

export const TracingVisualizationRow = (props: ITracingVizualizationRowProps) => {
  const { name, total, offset, duration, type, color } = props;

  const backgroundColorCss = getBackgroundColors(color || type);

  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(250);
  useLayoutEffect(() => {
    const updateContainerWidth = debounce(() => {
      if (container.current) {
        const { width } = container.current.getBoundingClientRect();
        setWidth(width);
      }
    }, 600);

    window.addEventListener('resize', updateContainerWidth);

    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [])

  const {
    marginLeftPercentage,
    marginLeftCss,
    showBeforeDuration,
    showAllBeforeDuration,
    widthPercentageCss,
  } = useMemo(() => {
    const percentage = 100 / (width || 1);
    const marginLeftPercentage = ((offset || 0) / total) * 100;
    const widthPercentage = (duration / total) * 100;
    const isAt100 = (marginLeftPercentage + percentage) >= 100
    const marginLeftCss = isAt100 ? `calc(${marginLeftPercentage}% - 1px)` : `${marginLeftPercentage}%`;
    const widthPercentageCss = widthPercentage <= percentage ? "1px" : `${widthPercentage}%`;

    const showBeforeDuration = widthPercentage <= 50 && marginLeftPercentage >= 50;
    const showAllBeforeDuration = showBeforeDuration && marginLeftPercentage > 90;

    return {
      marginLeftPercentage,
      marginLeftCss,
      showBeforeDuration,
      showAllBeforeDuration,
      widthPercentageCss,
    }
  }, [width])

  return (
    <div ref={container} className={`w-full mb-1 whitespace-nowrap`}>
      {marginLeftPercentage > 0 && (
        <div className="inline-block text-right" style={{ width: marginLeftCss }}>
          {showBeforeDuration && (
            <span className="pr-2">
              {name || ''}
            </span>
          )}

          {showAllBeforeDuration && (
            <span className="pr-2">
              {nsToMs(duration)} ms
            </span>
          )}
        </div>
      )}


      <div className={`inline-block ${backgroundColorCss}`} style={{ width: widthPercentageCss }}>
        <div className="flex justify-between">
          {!showBeforeDuration && (
            <span className="pl-2">
              {(name || '')}
            </span>
          )}

          {showAllBeforeDuration ? (
            <>&nbsp;</>
          ) : (
            <span className="pr-2 pl-2">
              {nsToMs(duration)} ms
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const getBackgroundColors = (type: string = "") => {
  switch (type.toUpperCase()) {
    case "GREEN":
    case "TOTAL":
      return "bg-green-300 dark:bg-green-700";
    case "PURPLE":
    case "QUERY":
    case "MUTATION":
    case "SUBSCRIPTION":
      return "bg-purple-300 dark:bg-purple-700";
    default:
    case "INDIGO":
      return "bg-indigo-300 dark:bg-indigo-700";
  }
}
