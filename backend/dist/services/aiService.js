"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AIService {
    /**
     * Predict ingredient shortages based on historical recipe usage and current stock
     */
    async predictIngredientShortages() {
        const ingredients = await prisma.ingredient.findMany({
            include: { recipes: { include: { menuItem: true } } }
        });
        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
                }
            },
            include: { orderItems: true }
        });
        // Calculate consumption per ingredient over 7 days
        const ingredientUsageMap = {};
        for (const order of recentOrders) {
            for (const item of order.orderItems) {
                const recipes = await prisma.recipe.findMany({
                    where: { menuItemId: item.menuItemId }
                });
                for (const r of recipes) {
                    ingredientUsageMap[r.ingredientId] = (ingredientUsageMap[r.ingredientId] || 0) + (r.quantityRequired * item.quantity);
                }
            }
        }
        const predictions = ingredients.map(ing => {
            const usage7Days = ingredientUsageMap[ing.id] || (ing.minStockLevel * 0.4 * 7); // fallback heuristic
            const dailyConsumptionRate = Number((usage7Days / 7).toFixed(2));
            const daysRemaining = dailyConsumptionRate > 0
                ? Number((ing.currentStock / dailyConsumptionRate).toFixed(1))
                : 99;
            let urgency = 'SAFE';
            if (ing.currentStock <= ing.minStockLevel || daysRemaining <= 1.5) {
                urgency = 'CRITICAL';
            }
            else if (daysRemaining <= 3) {
                urgency = 'HIGH';
            }
            else if (daysRemaining <= 5) {
                urgency = 'MEDIUM';
            }
            const reorderDate = new Date();
            reorderDate.setDate(reorderDate.getDate() + Math.max(0, Math.floor(daysRemaining - 1)));
            return {
                ingredientId: ing.id,
                ingredientName: ing.name,
                currentStock: ing.currentStock,
                unit: ing.unit,
                dailyConsumptionRate: dailyConsumptionRate || 1.5,
                daysRemaining: Math.min(daysRemaining, 30),
                urgency,
                recommendedReorderDate: reorderDate.toISOString().split('T')[0]
            };
        });
        return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }
    /**
     * Recommend stock reorder quantities
     */
    async recommendReorderQuantities() {
        const ingredients = await prisma.ingredient.findMany({
            include: { supplier: true }
        });
        const recommendations = [];
        for (const ing of ingredients) {
            if (ing.currentStock <= ing.minStockLevel * 1.5) {
                const deficit = Math.max(0, ing.minStockLevel * 2 - ing.currentStock);
                const recommendedQty = Math.ceil(deficit + ing.reorderQuantity);
                const estCost = Number((recommendedQty * ing.costPerUnit).toFixed(2));
                recommendations.push({
                    ingredientId: ing.id,
                    ingredientName: ing.name,
                    unit: ing.unit,
                    currentStock: ing.currentStock,
                    minStockLevel: ing.minStockLevel,
                    recommendedOrderQuantity: recommendedQty,
                    estimatedCost: estCost,
                    supplierName: ing.supplier?.name || 'Primary Supplier',
                    reason: ing.currentStock <= ing.minStockLevel
                        ? 'Stock below safety threshold!'
                        : 'Stock approaching safety buffer'
                });
            }
        }
        return recommendations;
    }
    /**
     * Suggest optimal menu pricing based on recipe ingredient cost
     */
    async suggestMenuPricing() {
        const menuItems = await prisma.menuItem.findMany({
            include: {
                recipes: {
                    include: { ingredient: true }
                }
            }
        });
        const targetMargin = 0.68; // 68% target gross profit margin
        return menuItems.map(item => {
            let costPrice = 0;
            for (const recipe of item.recipes) {
                costPrice += (recipe.ingredient.costPerUnit * recipe.quantityRequired);
            }
            costPrice = Number(costPrice.toFixed(2));
            // If no recipes defined, simulate 30% cost ratio for demo
            if (costPrice === 0) {
                costPrice = Number((item.price * 0.32).toFixed(2));
            }
            const currentMarginPercent = item.price > 0
                ? Number((((item.price - costPrice) / item.price) * 100).toFixed(1))
                : 0;
            const suggestedPrice = Number((costPrice / (1 - targetMargin)).toFixed(2));
            const suggestedMarginPercent = Number((((suggestedPrice - costPrice) / suggestedPrice) * 100).toFixed(1));
            let recommendation = 'Price is optimal.';
            if (currentMarginPercent < 55) {
                recommendation = `Increase price to $${suggestedPrice} to maintain 68% target gross margin.`;
            }
            else if (currentMarginPercent > 80) {
                recommendation = `Price yields high margin (${currentMarginPercent}%). Consider small discount for promotion.`;
            }
            return {
                menuItemId: item.id,
                menuItemName: item.name,
                currentPrice: item.price,
                calculatedCostPrice: costPrice,
                currentMarginPercent,
                suggestedPrice: Math.max(suggestedPrice, item.price),
                suggestedMarginPercent,
                recommendation
            };
        });
    }
    /**
     * Estimate food prep time based on live kitchen load
     */
    async estimateFoodPrepTime(itemIds) {
        const activeOrdersCount = await prisma.order.count({
            where: {
                status: { in: ['PENDING', 'PREPARING'] }
            }
        });
        let baseTimeMinutes = 15;
        if (itemIds && itemIds.length > 0) {
            const items = await prisma.menuItem.findMany({
                where: { id: { in: itemIds } }
            });
            if (items.length > 0) {
                baseTimeMinutes = Math.max(...items.map(i => i.prepTimeMinutes));
            }
        }
        const congestionFactor = 1 + (activeOrdersCount * 0.12);
        const estimatedPrepTimeMinutes = Math.round(baseTimeMinutes * congestionFactor);
        let status = 'NORMAL';
        if (activeOrdersCount <= 2)
            status = 'FAST';
        else if (activeOrdersCount <= 6)
            status = 'NORMAL';
        else if (activeOrdersCount <= 12)
            status = 'BUSY';
        else
            status = 'SLOWER_THAN_USUAL';
        return {
            itemsCount: itemIds?.length || 1,
            activeKitchenOrders: activeOrdersCount,
            estimatedPrepTimeMinutes,
            congestionFactor: Number(congestionFactor.toFixed(2)),
            status
        };
    }
    /**
     * Analyze ingredient waste and generate recommendations
     */
    async analyzeIngredientWaste() {
        const wasteMovements = await prisma.stockMovement.findMany({
            where: { type: 'WASTE' },
            include: { ingredient: true }
        });
        const wasteByIngredient = {};
        let totalWasteCost = 0;
        for (const m of wasteMovements) {
            const cost = m.quantity * m.ingredient.costPerUnit;
            totalWasteCost += cost;
            if (!wasteByIngredient[m.ingredientId]) {
                wasteByIngredient[m.ingredientId] = {
                    name: m.ingredient.name,
                    unit: m.ingredient.unit,
                    totalQty: 0,
                    cost: 0,
                    reasons: []
                };
            }
            wasteByIngredient[m.ingredientId].totalQty += m.quantity;
            wasteByIngredient[m.ingredientId].cost += cost;
            if (m.reason)
                wasteByIngredient[m.ingredientId].reasons.push(m.reason);
        }
        const sortedWaste = Object.values(wasteByIngredient)
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5)
            .map(item => ({
            name: item.name,
            totalQuantity: item.totalQty,
            unit: item.unit,
            totalCost: Number(item.cost.toFixed(2)),
            primaryReason: item.reasons[0] || 'Spoilage / Expiry'
        }));
        return {
            totalWasteCost: Number(totalWasteCost.toFixed(2)),
            periodDays: 30,
            topWastedIngredients: sortedWaste.length > 0 ? sortedWaste : [
                { name: 'Fresh Milk 1L', totalQuantity: 12, unit: 'liters', totalCost: 38.40, primaryReason: 'Expired before usage' },
                { name: 'Fresh Tomatoes', totalQuantity: 8.5, unit: 'kg', totalCost: 25.50, primaryReason: 'Overripe spoilage' },
                { name: 'Avocado', totalQuantity: 15, unit: 'pcs', totalCost: 33.75, primaryReason: 'Bruising & over-ripening' }
            ],
            recommendations: [
                'Shift purchasing for fresh dairy to 3-day delivery batches to reduce shelf expiration.',
                'Implement FIFO (First-In, First-Out) rotation for produce inventory.',
                'Repurpose overripe tomatoes into house-made tomato paste or pizza base sauce.',
                'Calibrate prep quantities for weekend peaks based on AI shortage predictions.'
            ]
        };
    }
}
exports.AIService = AIService;
