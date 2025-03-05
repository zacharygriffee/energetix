# Documentation: Triggering Mechanism for Energy Consumption

This document explains the test titled **"Use a triggering mechanism to trigger production and consumption"** in Energetix. The test demonstrates how a reactive trigger can force re-evaluation of energy consumption and how important it is to correctly define dependencies in your strategy functions.

## Overview

In this test, we simulate a scenario where a house has multiple appliances consuming power. The energy node represents the available power, and a consumer strategy node determines how much energy should be consumed based on the current total cost of the appliances. A trigger is used to force re-computation of the strategy decision, ensuring that the energy node is updated accordingly.

## Key Concepts

### 1. Purity in Strategy Functions

The strategy function used in this test is defined as:

```js
(energy, { house: { cost, power } }) => ({ energyCost: cost, action: "consume", power })
```

**Why Purity Matters:**

- **Purity & Determinism:**  
  The function is pure—it produces the same output given the same inputs. However, if only `cost` were passed as a dependency and it remains unchanged, the function would not trigger a re-computation (since its output would be the same).

- **Ensuring Causality with Dependent Variables:**  
  To ensure that any change in the computation dependencies triggers a new emission, both `cost` and `power` are included. Even if `cost` remains the same, a change in `power` (or vice versa) will cause the strategy to re-calculate and emit a decision. This is critical for proper reactive behavior in a dependency graph.

### 2. Reactive Triggering Mechanism

- **Time Trigger:**  
  A trigger node (`timeTrigger`) is used to force re-evaluation. By calling `timeTrigger.next()`, we simulate a time-based event that prompts the consumer node to re-run its strategy function, even if the underlying state (e.g., `cost`) has not changed.

- **Importance for Causality:**  
  The use of a trigger ensures that the reactive system acknowledges changes in dependent variables. Without it, if dependencies remain constant, the computed node might not emit, leaving downstream processes untriggered.

### 3. Snapshotting and State Capture

- **Deep Cloning:**  
  The test captures snapshots of the house state using deep cloning (`JSON.parse(JSON.stringify(house.value))`). This guarantees that each snapshot represents the state at that moment, rather than a reference to the same object that might be updated later.

- **Verifying Changes Over Time:**  
  The snapshots demonstrate how power is reduced incrementally as the consumer strategy consumes energy. They provide a clear view of the state evolution, validating that the system responds correctly to the trigger events.

### 4. Overall Test Flow

- **Initialization:**  
  The energy node starts at 100 units, and appliance nodes are created with defined power costs (e.g., refrigerator: 10, tv: 4, light: 1). A `powerCost` node computes the total cost, and a `powerIsOn` node indicates whether available power is sufficient.

- **Strategy and Sink Setup:**  
  The consumer strategy node uses the strategy function mentioned above to determine the energy cost (which is the current total cost). The sink then consumes energy by subtracting the `energyCost` from the energy node.

- **Trigger and State Verification:**  
  An interval calls the trigger periodically, causing the strategy node to re-evaluate. Snapshots are recorded, and assertions verify that power is reduced and that the overall state of the house (including the boolean `powerIsOn`) evolves as expected.

## Conclusion

This test illustrates how important it is to include all relevant dependencies (like both `cost` and `power`) in a pure strategy function to ensure that changes in any dependent variable trigger a recomputation. The trigger mechanism further enforces this reactivity, ensuring that the energy consumption logic is applied consistently over time.

For further details, refer to the source code of the test in your repository. This approach lays the foundation for building more complex strategies and handling various stages of energy mutation in a reactive system.
