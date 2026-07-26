import React, { useState } from 'react';
import { 
  AIShortagePrediction, AIReorderRecommendation, AIPricingSuggestion, AIPrepTimeEstimate, AIWasteAnalysis 
} from '../types';
import { Cpu, AlertTriangle, ShoppingCart, DollarSign, Clock, Trash2, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../api';

interface AIStudioViewProps {
  shortagePredictions: AIShortagePrediction[];
  reorderRecommendations: AIReorderRecommendation[];
  pricingSuggestions: AIPricingSuggestion[];
  wasteAnalysis: AIWasteAnalysis | null;
}

export const AIStudioView: React.FC<AIStudioViewProps> = ({
  shortagePredictions,
  reorderRecommendations,
  pricingSuggestions,
  wasteAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'shortages' | 'reorder' | 'pricing' | 'preptime' | 'waste'>('shortages');
  const [prepEstimate, setPrepEstimate] = useState<AIPrepTimeEstimate | null>(null);
  const [loadingPrep, setLoadingPrep] = useState<boolean>(false);

  const handleRunPrepEstimate = async () => {
    setLoadingPrep(true);
    try {
      const res = await api.estimatePrepTime([]);
      setPrepEstimate(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrep(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top AI Studio Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-indigo-900/30 to-purple-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              RestaurantOS AI Intelligence Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase tracking-widest">
                FastAPI / ML Engine Active
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">Predictive inventory shortages, EOQ reorder quantities, pricing elasticity, waste reduction, and kitchen prep time estimation.</p>
          </div>
        </div>
      </div>

      {/* Subtabs for 5 AI Features */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('shortages')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'shortages' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-300" />
          1. Shortage Predictor ({shortagePredictions.length})
        </button>

        <button
          onClick={() => setActiveTab('reorder')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reorder' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-purple-300" />
          2. Reorder Recommender ({reorderRecommendations.length})
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pricing' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-300" />
          3. Menu Pricing AI ({pricingSuggestions.length})
        </button>

        <button
          onClick={() => setActiveTab('preptime')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'preptime' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-300" />
          4. Food Prep Estimator
        </button>

        <button
          onClick={() => setActiveTab('waste')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'waste' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Trash2 className="w-4 h-4 text-cyan-300" />
          5. Waste Analysis & Recommendations
        </button>
      </div>

      {/* FEATURE 1: SHORTAGE PREDICTOR */}
      {activeTab === 'shortages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortagePredictions.map(pred => (
              <div key={pred.ingredientId} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-base">{pred.ingredientName}</h3>
                  <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase ${
                    pred.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    pred.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {pred.urgency}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Stock:</span>
                    <span className="font-bold text-white">{pred.currentStock} {pred.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Velocity:</span>
                    <span className="text-slate-300">{pred.dailyConsumptionRate} {pred.unit}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Depletion:</span>
                    <span className="font-bold text-rose-400">{pred.daysRemaining} days</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Reorder By:</span>
                    <span className="font-semibold text-blue-400">{pred.recommendedReorderDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE 2: REORDER RECOMMENDER */}
      {activeTab === 'reorder' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Ingredient</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Min Level</th>
                <th className="p-4">Recommended Order Qty</th>
                <th className="p-4">Primary Supplier</th>
                <th className="p-4 text-right">Est. PO Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {reorderRecommendations.map(rec => (
                <tr key={rec.ingredientId} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white">{rec.ingredientName}</td>
                  <td className="p-4 text-rose-400 font-semibold">{rec.currentStock} {rec.unit}</td>
                  <td className="p-4 text-slate-400">{rec.minStockLevel} {rec.unit}</td>
                  <td className="p-4 font-extrabold text-blue-400">+{rec.recommendedOrderQuantity} {rec.unit}</td>
                  <td className="p-4 text-slate-400">{rec.supplierName}</td>
                  <td className="p-4 text-right font-black text-emerald-400">${rec.estimatedCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FEATURE 3: DYNAMIC PRICING AI */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricingSuggestions.map(item => (
            <div key={item.menuItemId} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-extrabold text-white text-base">{item.menuItemName}</h3>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Selling Price:</span>
                  <span className="font-bold text-white">${item.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipe Food Cost:</span>
                  <span className="text-rose-400">${item.calculatedCostPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Gross Margin:</span>
                  <span className="font-semibold text-amber-400">{item.currentMarginPercent}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-blue-400">AI Suggested Price:</span>
                  <span className="text-emerald-400">${item.suggestedPrice.toFixed(2)} ({item.suggestedMarginPercent}% margin)</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">&ldquo;{item.recommendation}&rdquo;</p>
            </div>
          ))}
        </div>
      )}

      {/* FEATURE 4: PREP TIME ESTIMATOR */}
      {activeTab === 'preptime' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-xl space-y-4">
          <h3 className="text-lg font-bold text-white">Live Kitchen Congestion & Food Prep Time Calculator</h3>
          <p className="text-xs text-slate-400">Calculates estimated order completion duration based on active kitchen tickets, cooking station load, and item complexity.</p>

          <button
            onClick={handleRunPrepEstimate}
            disabled={loadingPrep}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Calculate Live Kitchen Prep Time</span>
          </button>

          {prepEstimate && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs mt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Cooking Queue:</span>
                <span className="font-bold text-white">{prepEstimate.activeKitchenOrders} orders in progress</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kitchen Congestion Multiplier:</span>
                <span className="text-amber-400 font-semibold">{prepEstimate.congestionFactor}x</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold">
                <span className="text-white">Estimated Prep Duration:</span>
                <span className="text-emerald-400">{prepEstimate.estimatedPrepTimeMinutes} minutes</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE 5: WASTE ANALYSIS */}
      {activeTab === 'waste' && wasteAnalysis && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-2">Total Monthly Spoilage Financial Impact</h3>
            <h2 className="text-3xl font-black text-rose-400">${wasteAnalysis.totalWasteCost.toFixed(2)}</h2>
            <p className="text-xs text-slate-400 mt-1">Aggregated ingredient waste over past 30 days</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm">Top Wasted Ingredients</h4>
              <div className="space-y-2">
                {wasteAnalysis.topWastedIngredients.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-400">{item.totalQuantity} {item.unit} &bull; {item.primaryReason}</p>
                    </div>
                    <span className="font-black text-rose-400">${item.totalCost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm">AI Waste Reduction Action Plan</h4>
              <div className="space-y-2 text-xs">
                {wasteAnalysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
