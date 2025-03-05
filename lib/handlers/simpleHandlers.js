const simpleConsumptionHandler = (energyNode, strategyNode) => {
    strategyNode.subscribe(decision => {
        if (decision && decision.action === 'consume' && typeof decision.energyCost === 'number') {
            energyNode.update(val => val - decision.energyCost);
        }
    });
};

const simpleProductionHandler = (energyNode, strategyNode) => {
    strategyNode.subscribe(decision => {
        if (decision && decision.action === 'produce' && typeof decision.energyGain === 'number') {
            energyNode.update(val => val + decision.energyGain);
        }
    });
};

export { simpleConsumptionHandler, simpleProductionHandler };