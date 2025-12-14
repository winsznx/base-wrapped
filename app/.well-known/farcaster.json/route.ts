import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Return the manifest in the exact format expected by Farcaster
  // Per docs: use `accountAssociation` + `frame` keys
  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    frame: {
      version: "1",
      name: minikitConfig.miniapp.name,
      iconUrl: minikitConfig.miniapp.iconUrl,
      homeUrl: minikitConfig.miniapp.homeUrl,
      imageUrl: minikitConfig.miniapp.imageUrl,
      buttonTitle: minikitConfig.miniapp.buttonTitle,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    },
  };
  
  return Response.json(manifest);
}
