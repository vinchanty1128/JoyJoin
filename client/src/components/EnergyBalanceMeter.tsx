interface EnergyBalanceMeterProps {
  energizers: number;
  connectors: number;
  reflectors: number;
}

export default function EnergyBalanceMeter({ energizers, connectors, reflectors }: EnergyBalanceMeterProps) {
  const total = energizers + connectors + reflectors;
  const energizerPct = (energizers / total) * 100;
  const connectorPct = (connectors / total) * 100;
  const reflectorPct = (reflectors / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Tonight's Mix</span>
        <span className="font-medium">{total} people</span>
      </div>
      
      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
        {energizerPct > 0 && (
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-500 transition-all"
            style={{ width: `${energizerPct}%` }}
          />
        )}
        {connectorPct > 0 && (
          <div 
            className="bg-gradient-to-r from-violet-400 to-purple-500 transition-all"
            style={{ width: `${connectorPct}%` }}
          />
        )}
        {reflectorPct > 0 && (
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
            style={{ width: `${reflectorPct}%` }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span>⚡</span>
          <span className="text-muted-foreground">{energizers} Energizer{energizers !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🤝</span>
          <span className="text-muted-foreground">{connectors} Connector{connectors !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🌿</span>
          <span className="text-muted-foreground">{reflectors} Reflector{reflectors !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
