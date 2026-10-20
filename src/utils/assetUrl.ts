import manifest from "@/generated/asset-manifest.json";
/** Content-addressed URLs make immutable caching safe when an asset is replaced. */
export function assetUrl(url:string):string { return (manifest as Record<string,string>)[url] ?? url; }
