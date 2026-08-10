import { describe, expect, it } from "vitest";
import { requiredPlanForFeature } from "@/lib/types/billing";

describe("requiredPlanForFeature", () => {
  it("maps premium features to Personal Pro", () => {
    expect(requiredPlanForFeature("advancedAi")).toBe("PERSONAL_PRO");
    expect(requiredPlanForFeature("voiceControl")).toBe("PERSONAL_PRO");
    expect(requiredPlanForFeature("networkInformation")).toBe("PERSONAL_PRO");
  });

  it("maps team features to Business", () => {
    expect(requiredPlanForFeature("teamManagement")).toBe("BUSINESS");
    expect(requiredPlanForFeature("auditLogs")).toBe("BUSINESS");
  });
});
