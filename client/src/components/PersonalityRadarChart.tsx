interface PersonalityRadarChartProps {
  traits: Array<{ name: string; score: number; maxScore: number }>;
}

export default function PersonalityRadarChart({ traits }: PersonalityRadarChartProps) {
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 100;
  
  const points = traits.map((trait, index) => {
    const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
    const ratio = trait.score / trait.maxScore;
    const x = centerX + Math.cos(angle) * maxRadius * ratio;
    const y = centerY + Math.sin(angle) * maxRadius * ratio;
    return { x, y, angle, ratio };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const maxPolygonPoints = traits.map((_, index) => {
    const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * maxRadius;
    const y = centerY + Math.sin(angle) * maxRadius;
    return `${x},${y}`;
  }).join(' ');

  const labelPoints = traits.map((trait, index) => {
    const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
    const labelRadius = maxRadius + 30;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    return { x, y, trait, angle };
  });

  return (
    <div className="flex items-center justify-center w-full py-4">
      <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        <polygon
          points={maxPolygonPoints}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {[0.25, 0.5, 0.75].map((scale) => {
          const scaledPoints = traits.map((_, index) => {
            const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius * scale;
            const y = centerY + Math.sin(angle) * maxRadius * scale;
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <polygon
              key={scale}
              points={scaledPoints}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        {traits.map((_, index) => {
          const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
          const x = centerX + Math.cos(angle) * maxRadius;
          const y = centerY + Math.sin(angle) * maxRadius;
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
          />
        ))}

        {labelPoints.map((label, index) => {
          let textAnchor: "start" | "middle" | "end" = "middle";
          let dy = "0.3em";
          
          if (label.angle > -Math.PI/2 + 0.3 && label.angle < Math.PI/2 - 0.3) {
            textAnchor = "start";
          } else if (label.angle > Math.PI/2 + 0.3 || label.angle < -Math.PI/2 - 0.3) {
            textAnchor = "end";
          }
          
          if (label.angle < -Math.PI * 0.7 || label.angle > Math.PI * 0.7) {
            dy = "1em";
          } else if (label.angle > -Math.PI * 0.3 && label.angle < Math.PI * 0.3) {
            dy = "-0.5em";
          }

          return (
            <text
              key={index}
              x={label.x}
              y={label.y}
              textAnchor={textAnchor}
              dy={dy}
              className="text-xs font-medium fill-foreground"
            >
              {label.trait.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
