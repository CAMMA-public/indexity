export const buildOrder = (orders: string[]): { [field: string]: string } => {
  const order = {};
  for (const filter of orders.map(f => f.split(','))) {
    const field = filter[0];
    const direction = filter[1];
    order[field] = direction;
  }
  return order;
};
