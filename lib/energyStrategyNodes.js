import {createNode} from "dagify";
import {energyTypes} from "./energyTypes.js";


// Pseudocode for a pure energy consumer node
const energyConsumer = (energyNode, contextNode, strategyFunction) => {
    // Create a node that outputs a strategy decision
    // It takes the current energy and context, applies the strategy, and emits a decision.
    const decisionNode = createNode(
        ({ energy, context }) => strategyFunction(energy, context),
        { energy: energyNode, context: contextNode, lastValue: energyNode.value },
        { type: energyTypes.getType("energyConsumptionStrategy") }
    );

    // The decisionNode emits an object like:
    // { action: 'consume', energyCost: 50 } or { action: 'defer', energyCost: 50, percentage: 0.5 }
    // It does not modify the energyNode directly.

    return decisionNode;
};

// Pseudocode for a pure energy producer node
const energyProducer = (energyNode, contextNode, productionStrategyFunction) => {
    // The eventNode might be a reactive node that fires when an external event occurs.
    // The producer node maps the event and context to a production decision.
    const productionDecisionNode = createNode(
        ({ event, context }) => productionStrategyFunction(event, context),
        { energy: energyNode, context: contextNode, lastValue: energyNode.value },
        { type: energyTypes.getType("energyProductionStrategy") }
    );

    // The productionDecisionNode emits an object like:
    // { energyGain: 100, metadata: { reason: "bitcoin payment" } }
    return productionDecisionNode;
};


export { energyConsumer, energyProducer };