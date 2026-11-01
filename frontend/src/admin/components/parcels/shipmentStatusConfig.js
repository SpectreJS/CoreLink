export const shipmentStatusConfig = {
  received: { icon: 'schedule', tone: 'gray' },
  air_transit: { icon: 'send', tone: 'cyan' },
  sea_transit: { icon: 'directions_boat', tone: 'cyan' },
  customs_clearance: { icon: 'gavel', tone: 'orange' },
  ready_for_pickup: { icon: 'inventory_2', tone: 'violet' },
  delivered: { icon: 'check_circle', tone: 'green' },
  delayed: { icon: 'warning', tone: 'red' },
};

export function getShipmentStatusConfig(value) {
  return shipmentStatusConfig[value] || { icon: 'help', tone: 'gray' };
}
