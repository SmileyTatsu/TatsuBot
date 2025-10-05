export const NOVELAI_BASE_URL = "https://image.novelai.net";

export const NOVELAI_IMAGE_GENERATION_MODELS = [
    "nai-diffusion-4-5-full",
    "nai-diffusion-4-5-curated",
];

export const NOVELAI_SAMPLERS = [
    "k_euler",
    "k_euler_ancestral",
    "k_dpmpp_2s_ancestral",
    "k_dpmpp_2m_sde",
    "k_dpmpp_2m",
    "k_dpmpp_sde",
];

export const NOVELAI_SCHEDULERS = ["karras", "exponential", "polyexponential"];

export const NOVELAI_PRIORITY_PER_ROLE = {
    default: 1,
    "People who own me": 3,
    "Server Booster": 3,
    Hero: 4,
    Smiley: 10,
};

export const NOVELAI_USAGE_LIMITS_PER_ROLE = {
    default: 100,
    "People who own me": -1,
    "Server Booster": -1,
    Hero: -1,
    Smiley: -1,
};

export const NOVELAI_RESOLUTIONS: {
    [key: string]: { width: number; height: number };
} = {
    portrait: { width: 832, height: 1216 },
    landscape: { width: 1216, height: 832 },
    square: { width: 1024, height: 1024 },
};
