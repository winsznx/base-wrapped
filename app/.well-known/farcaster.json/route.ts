import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Return the manifest in the format expected by Farcaster
  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    miniapp: minikitConfig.miniapp,
    // For backward compatibility
    frame: minikitConfig.miniapp,
  };

  return Response.json(manifest);
}
