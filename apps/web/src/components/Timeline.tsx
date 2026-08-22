import React from "react";

export interface TimelineProps {
  active?: number;
  bulletSize?: number;
  lineWidth?: number;
  children: React.ReactNode;
  className?: string;
}

export interface TimelineItemProps {
  bullet?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  __index?: number;
  __active?: number;
  __bulletSize?: number;
  __lineWidth?: number;
  __isLast?: boolean;
}

export function Text({
  children,
  c,
  size = "sm",
  mt,
  className = "",
  variant,
  component,
  inherit,
}: {
  children: React.ReactNode;
  c?: "dimmed" | "blue" | "teal" | "red" | "green";
  size?: "xs" | "sm" | "md";
  mt?: number | string;
  className?: string;
  variant?: "link";
  component?: "span" | "p" | "div";
  inherit?: boolean;
}) {
  const Component = component || (variant === "link" ? "span" : "p");

  const sizeClass =
    size === "xs" ? "text-xs" : size === "md" ? "text-base" : "text-sm";

  const colorClass =
    c === "dimmed"
      ? "text-[#909296]"
      : c === "blue"
      ? "text-[#339af0]"
      : c === "green"
      ? "text-[#22C55E]"
      : c === "teal"
      ? "text-[#20c997]"
      : c === "red"
      ? "text-[#fa5252]"
      : "text-[#c1c2c5]";

  const linkClass =
    variant === "link"
      ? "text-[#339af0] hover:underline cursor-pointer"
      : "";

  let marginStyle: React.CSSProperties = {};
  if (typeof mt === "number") {
    marginStyle = { marginTop: `${mt}px` };
  }

  return (
    <Component
      style={marginStyle}
      className={`${sizeClass} ${colorClass} ${linkClass} ${className} leading-normal`}
    >
      {children}
    </Component>
  );
}

function TimelineItem({
  bullet,
  title,
  children,
  __index = 0,
  __active = 0,
  __bulletSize = 24,
  __lineWidth = 2,
  __isLast = false,
}: TimelineItemProps) {
  const isCompleted = __active > __index;
  const isCurrent = __active === __index;
  const isPending = __active < __index;

  const bulletOffset = Math.floor((__bulletSize - __lineWidth) / 2);

  return (
    <div className="relative flex gap-3 pb-6 last:pb-1 text-left">
      {/* Consistent Solid Vertical Connecting Line */}
      {!__isLast && (
        <div
          className={`absolute transition-colors duration-300 ease-out ${
            isCompleted ? "bg-[#22C55E]" : "bg-[#2c2e33]"
          }`}
          style={{
            left: `${bulletOffset}px`,
            width: `${__lineWidth}px`,
            top: `${__bulletSize + 2}px`,
            bottom: "-2px",
          }}
        />
      )}

      {/* Bullet Indicator (Completed: GREEN with animated checkmark, Current: BLUE, Pending: MUTED) */}
      <div
        className={`relative z-10 flex items-center justify-center rounded-full flex-shrink-0 transition-colors duration-250 ease-out ${
          isCompleted
            ? "bg-[#22C55E] border-2 border-[#22C55E] text-white shadow-sm"
            : isCurrent
            ? "bg-[#228be6] border-2 border-[#228be6] text-white"
            : "bg-[#1a1b1e] border-2 border-[#373a40] text-[#909296]"
        }`}
        style={{
          width: `${__bulletSize}px`,
          height: `${__bulletSize}px`,
        }}
      >
        {isCompleted ? (
          <svg
            className="w-3.5 h-3.5 text-white animate-[checkmarkIn_200ms_ease-out_forwards]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        ) : (
          bullet
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <div className="text-sm font-semibold text-[#c1c2c5] leading-snug">
            {title}
          </div>
        )}
        <div className="mt-0.5 space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

export function Timeline({
  active = 0,
  bulletSize = 24,
  lineWidth = 2,
  children,
  className = "",
}: TimelineProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <div className={`flex flex-col ${className}`}>
      {items.map((child, index) => {
        const isLast = index === items.length - 1;
        return React.cloneElement(child as React.ReactElement<TimelineItemProps>, {
          __index: index,
          __active: active,
          __bulletSize: bulletSize,
          __lineWidth: lineWidth,
          __isLast: isLast,
        });
      })}
    </div>
  );
}

Timeline.Item = TimelineItem;
