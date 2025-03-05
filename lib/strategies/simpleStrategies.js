// Default Energy Consumption Strategy
import {NO_EMIT} from "dagify";

const simpleConsumptionStrategy = (energy, context) => {
    // Expecting context to have a numeric 'cost' property
    if (typeof context.cost === 'number' && context.cost > 0) {
        return { energyCost: context.cost, action: 'consume' };
    }
    return NO_EMIT;
};

// Default Energy Production Strategy
const simpleProductionStrategy = (energy, context) => {
    // Expecting context to have a numeric 'gain' property
    if (typeof context.gain === 'number' && context.gain > 0) {
        return { energyGain: context.gain, action: 'produce' };
    }
    return NO_EMIT;
};

export { simpleProductionStrategy, simpleConsumptionStrategy }
