import "./demo.css";

export function DemoWatermark({ print = false }: { print?: boolean }) {
  return (
    <div
      className={print ? "demo-print-watermark" : "demo-preview-watermark"}
      aria-label="Demo only"
    >
      <svg viewBox="0 0 800 1100" width="100%" height="100%" aria-hidden="true">
        <g
          transform="rotate(-32 400 550)"
          fill="#8d4936"
          fillOpacity="0.22"
          fontFamily="sans-serif"
          fontWeight="800"
          fontSize="86"
          textAnchor="middle"
        >
          <text x="400" y="300">
            DEMO ONLY
          </text>
          <text x="400" y="580">
            DEMO ONLY
          </text>
          <text x="400" y="860">
            DEMO ONLY
          </text>
        </g>
      </svg>
    </div>
  );
}
