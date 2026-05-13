export const NIM_CONFIG = {
  baseUrl: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY!,
  chatModel: "meta/llama-3.3-70b-instruct",
  embeddingModel: "nvidia/nv-embedqa-e5-v5",
  embeddingDimensions: 1024,
  timeout: 120_000,
}
