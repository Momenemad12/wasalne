export const defaultPricing = {
  "توك توك": {
    baseFare: 10,
    pricePerKm: 7,
    minimumFare: 20,
    negotiable: true,
  },

  "سيارة خاصة": {
    baseFare: 20,
    pricePerKm: 13,
    minimumFare: 50,
    negotiable: true,
  },

  موتوسيكل: {
    baseFare: 8,
    pricePerKm: 6,
    minimumFare: 20,
    negotiable: true,
  },

  "ميكروباص / فان": {
    baseFare: 25,
    pricePerKm: 10,
    minimumFare: 40,
    negotiable: false,
  },

  "عربية سوزوكي": {
    baseFare: 25,
    pricePerKm: 14,
    minimumFare: 60,
    negotiable: true,
  },

  "عربية نص نقل": {
    baseFare: 40,
    pricePerKm: 18,
    minimumFare: 100,
    negotiable: true,
  },

  تروسيكل: {
    baseFare: 18,
    pricePerKm: 12,
    minimumFare: 45,
    negotiable: true,
  },
};

export function getPricingSettings() {
  const savedPricing = localStorage.getItem("wasalne_pricing_settings");

  if (!savedPricing) {
    return defaultPricing;
  }

  try {
    return JSON.parse(savedPricing);
  } catch {
    return defaultPricing;
  }
}

export function savePricingSettings(pricing) {
  localStorage.setItem("wasalne_pricing_settings", JSON.stringify(pricing));
}

export function resetPricingSettings() {
  localStorage.removeItem("wasalne_pricing_settings");
}

function roundToFive(number) {
  return Math.round(number / 5) * 5;
}

export function calculatePriceRange(pricingSettings, vehicle, distance) {
  const pricing = pricingSettings[vehicle] || pricingSettings["توك توك"];

  const estimated = pricing.baseFare + pricing.pricePerKm * distance;

  const min = roundToFive(estimated * 0.9);
  const max = roundToFive(estimated * 1.15);

  const finalMin = Math.max(min, pricing.minimumFare);
  const finalMax = Math.max(max, pricing.minimumFare + 10);

  return {
    text: `${finalMin} - ${finalMax} ج`,
    negotiable: pricing.negotiable,
    min: finalMin,
    max: finalMax,
  };
}
