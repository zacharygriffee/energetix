import { Types } from "dagify";

const energyTypes = new Types.TypeRegistry();

energyTypes.registerType("energyConsumptionStrategy", value => {
    if (typeof value !== "object" || value === null) return false;

    if (typeof value.action !== "string") {
        return false;
    }

    // Validate energyCost: must be a non-negative number.
    if (typeof value.energyCost !== "number" || value.energyCost < 0) {
        return false;
    }

    // If action is 'partial', validate percentage.
    if (value.action === "partial") {
        if (typeof value.percentage !== "number" || value.percentage < 0 || value.percentage > 1) {
            return false;
        }
    }

    // Optional metadata can be any type; no validation needed.
    return true;
});

energyTypes.registerType("energyProductionStrategy", value => {
    if (typeof value !== "object" || value === null) return false;
    if (typeof value.action !== "string") {
        return false;
    }
    // Validate energyGain: must be a non-negative number.
    if (typeof value.energyGain !== "number" || value.energyGain < 0) {
        return false;
    }

    // Optional metadata or other fields can be added without extra checks.
    return true;
});



export { energyTypes }