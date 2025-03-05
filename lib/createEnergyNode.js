import { createNode } from 'dagify';

const createEnergyNode = amount => createNode(amount, undefined, { type: "uint", valueEncoding: "uint" });

export { createEnergyNode };