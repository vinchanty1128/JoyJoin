import EnergyBalanceMeter from '../EnergyBalanceMeter';

export default function EnergyBalanceMeterExample() {
  return (
    <div className="p-4 max-w-md">
      <EnergyBalanceMeter energizers={2} connectors={3} reflectors={3} />
    </div>
  );
}
