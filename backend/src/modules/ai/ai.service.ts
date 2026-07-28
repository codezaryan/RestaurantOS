import axios from "axios";
import { AIService } from "../../services/aiService";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export class AIApplicationService {

    private readonly aiService = new AIService();

    private async callFastAPI(
        endpoint: string,
        method: "GET" | "POST" = "GET",
        body?: any
    ) {

        try {

            const url = `${FASTAPI_URL}${endpoint}`;

            const config = {
                timeout: 15000
            };

            if (method === "GET") {
                const response = await axios.get(url, config);
                return response.data;
            }

            const response = await axios.post(
                url,
                body,
                config
            );

            return response.data;

        } catch {

            console.warn(
                `FastAPI unavailable. Falling back to local AI service.`
            );

            return null;
        }
    }

    async predictShortages() {

        const result = await this.callFastAPI(
            "/ai/predict-shortages"
        );

        if (result) {
            return result;
        }

        return this.aiService.predictIngredientShortages();

    }

    async recommendReorder() {

        const result = await this.callFastAPI(
            "/ai/recommend-reorder"
        );

        if (result) {
            return result;
        }

        return this.aiService.recommendReorderQuantities();

    }

    async suggestPricing() {

        const result = await this.callFastAPI(
            "/ai/suggest-pricing"
        );

        if (result) {
            return result;
        }

        return this.aiService.suggestMenuPricing();

    }

    async estimatePrepTime(itemIds: string[]) {

        const result = await this.callFastAPI(
            "/ai/estimate-prep-time",
            "POST",
            {
                itemIds
            }
        );

        if (result) {
            return result;
        }

        return this.aiService.estimateFoodPrepTime(itemIds);

    }

    async analyzeWaste() {

        const result = await this.callFastAPI(
            "/ai/analyze-waste"
        );

        if (result) {
            return result;
        }

        return this.aiService.analyzeIngredientWaste();

    }

}

export const aiService = new AIApplicationService();