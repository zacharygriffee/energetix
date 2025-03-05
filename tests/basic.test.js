import { test } from "brittle";
import { energyConsumer, energyProducer } from "../lib/strategies/energyStrategyNodes.js";
import { createExecutionNode, createNode, NO_EMIT, trigger } from "dagify";
import { sleep } from "./helpers/sleep.js";
import { createEnergyNode } from "../lib/state-nodes/createEnergyNode.js";
import { energyTypes } from "../lib/types/energyTypes.js";

// Helper to set the node's type after creation.
// If the current value does not satisfy the new type, it resets the internal value to NO_EMIT.
function setType(node, validator) {
    node.type = validator;
    if (!validator(node.value)) {
        // Eradicate the current value because it doesn't match new type.
        node._value = NO_EMIT;
    }
    return node;
}

test("energyNode typed node ensures it can only be a whole positive number", async t => {
    const n = createEnergyNode(100);
    t.is(n.value, 100, "Initial valid value should be accepted");

    // Test negative update: value remains unchanged.
    n.set(-123);
    await sleep();
    t.is(n.value, 100, "Negative value should be rejected");

    // Test non-integer update: value remains unchanged.
    n.set(10.23);
    await sleep();
    t.is(n.value, 100, "Non-whole number should be rejected");

    // Test valid update.
    n.set(1000);
    t.is(n.value, 1000, "Valid whole positive number should update");

    // Additional robust check: multiple invalid updates in a row.
    n.set(-50);
    n.set(12.5);
    await sleep();
    t.is(n.value, 1000, "Multiple invalid updates should leave the value unchanged");
});

test("Apply Damage (Consume Energy)", async t => {
    // In this scenario, the energy node represents player health.
    // The consumer node subtracts incoming damage from health.
    const health = createEnergyNode(100);
    // The context now represents incoming damage (and includes a function for reporting).
    const context = createNode({ damage: 0, fn: () => "damage applied" });

    // energyConsumer creates a decision node using a strategy function.
    // Here, if damage > 0, it returns a decision object with the damage amount.
    const damageConsumer = energyConsumer(health, context, (energy, context) => {
        if (context.damage > 0) {
            return {
                energyCost: context.damage,
                action: "damage",
                fn: context.fn
            };
        } else return NO_EMIT;
    });

    let damageCount = 0;
    damageConsumer.subscribe(({ energyCost, action, fn }) => {
        if (action === "damage") {
            // Apply the damage by subtracting the energyCost.
            health.update(val => val - energyCost);
            damageCount++;
            t.is(fn(), "damage applied", "fn() should return 'damage applied'");
        }
    });

    await sleep();
    t.is(health.value, 100, "Initially, health remains at 100 (no damage)");

    // Update context with damage of 20.
    context.update(ctx => ({ ...ctx, damage: 20 }));
    await sleep();
    t.is(health.value, 80, "Health should drop to 80 after 20 damage");
    t.is(damageCount, 1, "Damage action should have fired once");

    // Now, simulate additional damage by increasing the damage value.
    context.update(ctx => ({ ...ctx, damage: 30 }));
    await sleep();
    t.is(health.value, 50, "Health should drop further to 50 after additional 30 damage");
    t.is(damageCount, 2, "Damage action should have fired twice");
});

test("Regenerate Shields (Produce Energy)", async t => {
    // In this scenario, the energy node represents player shields.
    // The producer node adds regeneration energy (i.e. shield points).
    const shields = createEnergyNode(0);
    // Here, the context represents a regeneration event.
    const context = createNode({ regen: 0, fn: () => "regen applied" });

    // energyProducer creates a decision node using the production strategy function.
    // When context.regen is greater than 0, the decision returns an energy gain.
    const regenProducer = energyProducer(shields, context, (energy, context) => {
        if (context.regen > 0) {
            return {
                energyGain: context.regen,
                action: "regen",
                fn: context.fn
            };
        } else return NO_EMIT;
    });

    let regenCount = 0;
    regenProducer.subscribe(({ energyGain, action, fn }) => {
        if (action === "regen") {
            // Apply regeneration by adding the energyGain.
            shields.update(val => val + energyGain);
            regenCount++;
            t.is(fn(), "regen applied", "fn() should return 'regen applied'");
        }
    });

    await sleep();
    t.is(shields.value, 0, "Initially, shields are 0");

    // Update context with a regeneration event of 15 points.
    context.update(ctx => ({ ...ctx, regen: 15 }));
    await sleep();
    t.is(shields.value, 15, "Shields should increase to 15 after regen applied");
    t.is(regenCount, 1, "Regen action should have fired once");

    // Now, update with a different regeneration value.
    context.update(ctx => ({ ...ctx, regen: 10 }));
    await sleep();
    t.is(shields.value, 25, "Shields should increase cumulatively to 25");
    t.is(regenCount, 2, "Regen action should have fired twice");
});

test("Dynamic type setting resets invalid value", async t => {
    // Create a node with an initial valid string value.
    const node = createNode("hello world");
    t.is(node.value, "hello world", "Initial string value is valid");

    // Dynamically set the node's type to require a number.
    setType(node, value => typeof value === "number");
    await sleep();
    t.is(node.value, NO_EMIT, "Node value resets to NO_EMIT when it does not match new type");

    // Now update with a valid number.
    node.set(42);
    t.is(node.value, 42, "Valid number update should be accepted");

    // Try an invalid update: string.
    node.set("not a number");
    await sleep();
    t.is(node.value, 42, "Invalid update after type set should leave value unchanged");
});

test("Multiple valid and invalid updates maintain consistent state", async t => {
    // Create a node with a number type enforced.
    const node = createNode(10);
    // Set the type to allow only positive integers.
    setType(node, value => Number.isInteger(value) && value > 0);
    await sleep();
    t.is(node.value, 10, "Initial value is valid");

    // Update with another valid value.
    node.set(20);
    t.is(node.value, 20, "Valid update accepted");

    // Try an invalid update: a negative integer.
    node.set(-5);
    await sleep();
    t.is(node.value, 20, "Negative update rejected");

    // Try an invalid update: a decimal.
    node.set(15.5);
    await sleep();
    t.is(node.value, 20, "Decimal update rejected");

    // Valid update again.
    node.set(30);
    t.is(node.value, 30, "Valid update accepted again");
});
