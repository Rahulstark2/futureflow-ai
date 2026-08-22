import React from "react";
import { PipelineStep } from "../hooks/useAnalyze";
import { Timeline, Text } from "./Timeline";

interface PipelineStatusProps {
  steps: PipelineStep[];
  analyzing: boolean;
  error: string | null;
}

export function PipelineStatus({ steps, analyzing, error }: PipelineStatusProps) {
  if (!analyzing && steps.every((s) => s.status === "pending")) return null;

  const activeStepIndex = steps.findIndex((s) => s.status === "running");
  const allCompleted = steps.every((s) => s.status === "completed");
  const active = allCompleted ? 5 : activeStepIndex >= 0 ? activeStepIndex : 0;

  return (
    <div className="py-2">
      <Timeline active={active} bulletSize={24} lineWidth={2}>
        {/* Step 1: Extracting Activities */}
        <Timeline.Item
          bullet={
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
              <path d="M208,128a32,32,0,0,0-23.75,10.55L142.11,108A32,32,0,0,0,144,96a32,32,0,1,0-40,30.85v46.3A32,32,0,1,0,120,208V126.85l42.14,30.59A32,32,0,1,0,208,128ZM128,48a16,16,0,1,1,16,16A16,16,0,0,1,128,48ZM96,208a16,16,0,1,1,16-16A16,16,0,0,1,96,208Zm112-48a16,16,0,1,1,16-16A16,16,0,0,1,208,160Z" />
            </svg>
          }
          title="Extracting Activities"
        >
          <Text c="dimmed" size="sm">
            Dissecting current workflow into sequential operational activities and decision points
          </Text>
          <Text size="xs" mt={4} c={active > 0 ? "green" : active === 0 ? "blue" : "dimmed"}>
            {active > 0 ? "Completed" : active === 0 ? "In progress..." : "Pending"}
          </Text>
        </Timeline.Item>

        {/* Step 2: Identifying Problems */}
        <Timeline.Item
          bullet={
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
              <path d="M248,120H199.4a72,72,0,0,0-142.8,0H8a8,8,0,0,0,0,16H56.6a72,72,0,0,0,142.8,0H248a8,8,0,0,0,0-16ZM128,184a56,56,0,1,1,56-56A56.06,56.06,0,0,1,128,184Z" />
            </svg>
          }
          title="Identifying Problems"
        >
          <Text c="dimmed" size="sm">
            Detecting operational bottlenecks, handoff delays, and risk areas
          </Text>
          <Text size="xs" mt={4} c={active > 1 ? "green" : active === 1 ? "blue" : "dimmed"}>
            {active > 1 ? "Completed" : active === 1 ? "In progress..." : "Pending"}
          </Text>
        </Timeline.Item>

        {/* Step 3: Generating AI Opportunities */}
        <Timeline.Item
          title="Generating AI Opportunities"
          bullet={
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
              <path d="M208,144a32,32,0,0,0-23.73,10.53L136,117.84V96a32,32,0,1,0-40,30.85v46.3A32,32,0,1,0,112,208V146.16l48.27,37.31A32,32,0,1,0,208,144ZM120,48a16,16,0,1,1,16,16A16,16,0,0,1,120,48ZM88,208a16,16,0,1,1,16-16A16,16,0,0,1,88,208Zm120-32a16,16,0,1,1,16-16A16,16,0,0,1,208,176Z" />
            </svg>
          }
        >
          <Text c="dimmed" size="sm">
            Uncovering high-leverage generative AI, automation, and intelligent agent use cases
          </Text>
          <Text size="xs" mt={4} c={active > 2 ? "green" : active === 2 ? "blue" : "dimmed"}>
            {active > 2 ? "Completed" : active === 2 ? "In progress..." : "Pending"}
          </Text>
        </Timeline.Item>

        {/* Step 4: Designing Future Process */}
        <Timeline.Item
          title="Designing Future Process"
          bullet={
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
              <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45,229.57a16,16,0,0,1-19.8-19.8l9.75-34.12A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.84,166.7a8,8,0,0,1,1.06,6.34L43.85,204.6l31.56-9.05a8,8,0,0,1,6.34,1.06A88,88,0,0,0,216,128Z" />
            </svg>
          }
        >
          <Text c="dimmed" size="sm">
            Architecting optimized to-be workflow with human-in-the-loop responsibilities
          </Text>
          <Text size="xs" mt={4} c={active > 3 ? "green" : active === 3 ? "blue" : "dimmed"}>
            {active > 3 ? "Completed" : active === 3 ? "In progress..." : "Pending"}
          </Text>
        </Timeline.Item>

        {/* Step 5: Computing Benefits */}
        <Timeline.Item
          title="Computing Benefits"
          bullet={
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM216,200H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm-40,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h56A8,8,0,0,1,144,160Z" />
            </svg>
          }
        >
          <Text c="dimmed" size="sm">
            Quantifying efficiency gains, cost reductions, and ROI metrics
          </Text>
          <Text size="xs" mt={4} c={active > 4 ? "green" : active === 4 ? "blue" : "dimmed"}>
            {active > 4 ? "Completed" : active === 4 ? "In progress..." : "Pending"}
          </Text>
        </Timeline.Item>
      </Timeline>

      {error && (
        <div className="mt-4 text-xs text-[#fa5252]">
          {error}
        </div>
      )}
    </div>
  );
}
