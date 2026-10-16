"use client";

import { useEffect } from "react";

export default function StepScript() {
  useEffect(() => {
    const addStep = () => {
      const container = document.getElementById("test-steps-container");
      if (!container) return;
      const count = container.querySelectorAll('[name="stepActions"]').length + 1;
      const stepDiv = document.createElement("div");
      stepDiv.className = "border border-[#C9D0D8] rounded p-3 bg-[#F5F7F9]";
      stepDiv.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-[#5B6675]">Step ${count}</span>
          <button type="button" class="text-xs text-[#8F2A20] hover:underline" onclick="removeStep(this)">Remove</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input name="stepActions" placeholder="Step action" class="input w-full text-sm" required />
          </div>
          <div>
            <input name="stepExpectedResults" placeholder="Expected result" class="input w-full text-sm" required />
          </div>
          <div>
            <input name="stepData" placeholder="Test data (optional)" class="input w-full text-sm" />
          </div>
        </div>
      `;
      container.appendChild(stepDiv);
    };

    const removeStep = (btn: HTMLElement) => {
      const container = document.getElementById("test-steps-container");
      if (!container) return;
      const steps = container.querySelectorAll("div.border");
      if (steps.length > 1) {
        btn.closest("div.border")?.remove();
        steps.forEach((step, idx) => {
          const label = step.querySelector("span");
          if (label) label.textContent = `Step ${idx + 1}`;
        });
      }
    };

    Object.assign(window, { addStep, removeStep });
  }, []);

  return null;
}
