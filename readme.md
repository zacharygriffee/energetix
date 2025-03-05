# Energetix

Energetix is a reactive energy management library built on top of [dagify](https://github.com/zacharygriffee/dagify). It provides a lightweight framework for modeling and managing dynamic resource flows—whether that's energy, power, health, or any abstract resource—by defining consumer and producer strategies within a reactive context.

> **Alpha Release:** This is an early release. The API is evolving, and additional strategies and features are planned for future stages. Expect breaking changes between 0.1.0 and 0.1.1

## Core Concepts

- **Reactive Resource Nodes:**  
  Build composable nodes that represent dynamic resource levels. These nodes update automatically when their dependencies change.

- **Energy Consumption & Production Strategies:**  
  Define strategies as pure functions to decide when to consume or produce energy (or other resources).  
  - **Consumption Strategies:** For reducing a resource (e.g., applying a cost, damage, or depletion).  
  - **Production Strategies:** For increasing a resource (e.g., regeneration, replenishment, or income).

- **Type Safety & Predictability:**  
  While the main focus is on modeling resource flows, type safety is integrated to ensure that values remain predictable and conventional throughout the reactive chain.

- **Broad Use Cases:**  
  Energetix isn’t just for games! It can be applied to:
  - **Simulation & Modeling:** Resource allocation in power grids, supply chains, or ecological systems.
  - **IoT & Smart Systems:** Managing sensor data or energy consumption in real time.
  - **Financial & Business Applications:** Modeling cash flows, inventory, or other resource dynamics.
  - **Dynamic User Interfaces:** Driving dashboards or monitoring tools that react to changes in resource states.

## Strategy Examples

### Energy Consumer Node

A consumer node applies a strategy to determine when to reduce a resource. For example, this strategy might decide to consume energy based on a cost parameter:

```js
import { createNode } from "dagify";
import { energyTypes } from "./energyTypes.js";

// Pure energy consumer node strategy
const energyConsumer = (energyNode, contextNode, strategyFunction) => {
    // Create a node that outputs a strategy decision based on current energy and context.
    const decisionNode = createNode(
        ({ energy, context }) => strategyFunction(energy, context),
        { energy: energyNode, context: contextNode, lastValue: energyNode.value },
        { type: energyTypes.getType("energyConsumptionStrategy") }
    );
    // The decision node emits an object such as:
    // { action: 'consume', energyCost: 50 }
    return decisionNode;
};
```

### Energy Producer Node

A producer node applies a strategy to determine when to increase a resource. For instance, this strategy might add to a resource based on a replenishment event:

```js
import { createNode } from "dagify";
import { energyTypes } from "./energyTypes.js";

// Pure energy producer node strategy
const energyProducer = (energyNode, contextNode, productionStrategyFunction) => {
    // Create a node that maps events and context to a production decision.
    const productionDecisionNode = createNode(
        ({ event, context }) => productionStrategyFunction(event, context),
        { energy: energyNode, context: contextNode, lastValue: energyNode.value },
        { type: energyTypes.getType("energyProductionStrategy") }
    );
    // The decision node emits an object such as:
    // { energyGain: 100, metadata: { reason: "replenishment" } }
    return productionDecisionNode;
};
```

## Installation

```bash
npm install energetix
```

## Quick Start Example

Below is an example where an energy node represents a resource (such as a battery, budget, or system capacity), and consumer/producer nodes adjust that resource based on contextual changes:

```js
import { createEnergyNode } from 'energetix';
import { createNode, NO_EMIT } from 'dagify';
import { energyConsumer } from 'energetix';

// Create an energy node starting at 100 units.
const resource = createEnergyNode(100);

// Create a context node that represents a consumption event.
const context = createNode({ cost: 0, fn: () => "consumption applied" });

// Create a consumer node using a consumption strategy.
const consumptionStrategy = (energy, context) =>
  context.cost > 0 ? { energyCost: context.cost, action: "consume" } : NO_EMIT;

const consumer = energyConsumer(resource, context, consumptionStrategy);

// Subscribe to consumption events.
consumer.subscribe(({ energyCost, action, fn }) => {
  if (action === "consume") {
    resource.update(val => val - energyCost);
    console.log(fn()); // Logs: "consumption applied"
  }
});

// Later, update the context to simulate resource consumption:
context.update(ctx => ({ ...ctx, cost: 25 }));
// Resource decreases from 100 to 75 based on the consumption strategy.
```

## Running Tests

Run the test suite to see real-world usage examples:

```bash
npm test
```

## Future Directions

Energetix is designed to evolve:
- **Additional Strategies:** More nuanced consumption and production strategies will be added to handle different stages of energy flow and diverse contextual conditions.
- **Broader Applications:** Expect enhancements that support a wider range of simulation and modeling scenarios beyond games or simple resource tracking.

## License

MIT

## Contributing

Contributions, suggestions for new strategies, and feedback are welcome. As this is an alpha release, the API is expected to change as new ideas and requirements emerge.