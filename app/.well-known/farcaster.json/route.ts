import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Return the manifest with all fields populated
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
      // Optional fields for app store listing
      webhookUrl: minikitConfig.miniapp.webhookUrl,
      subtitle: minikitConfig.miniapp.subtitle,
      description: minikitConfig.miniapp.description,
      screenshotUrls: minikitConfig.miniapp.screenshotUrls,
      primaryCategory: minikitConfig.miniapp.primaryCategory,
      tags: minikitConfig.miniapp.tags,
      heroImageUrl: minikitConfig.miniapp.heroImageUrl,
      tagline: minikitConfig.miniapp.tagline,
      ogTitle: minikitConfig.miniapp.ogTitle,
      ogDescription: minikitConfig.miniapp.ogDescription,
      ogImageUrl: minikitConfig.miniapp.ogImageUrl,
    },
  };

  return Response.json(manifest);
}
