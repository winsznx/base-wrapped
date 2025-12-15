import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { minikitConfig } from '../minikit.config';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  // Await search params for Next.js 15
  const params = await searchParams;

  const nm = params.nm as string;
  const p = params.p as string;
  const tx = params.tx as string;
  const pct = params.pct as string;
  const color = params.color as string;
  const builder = params.builder as string;

  // If we have stats params, generate dynamic OG image
  if (nm || p || tx) {
    const ogUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'https://base-wrapped-nine.vercel.app'}/api/og`);
    if (nm) ogUrl.searchParams.set('nm', nm);
    if (p) ogUrl.searchParams.set('p', p);
    if (tx) ogUrl.searchParams.set('tx', tx);
    if (pct) ogUrl.searchParams.set('pct', pct);
    if (color) ogUrl.searchParams.set('color', color);
    if (builder) ogUrl.searchParams.set('builder', builder);

    return {
      title: `${nm}'s 2025 on Base`,
      description: `Check out my onchain stats! I'm a ${p} (Top ${pct}% user).`,
      openGraph: {
        title: `${nm}'s 2025 on Base`,
        description: `Check out my onchain stats! I'm a ${p} (Top ${pct}% user).`,
        images: [
          {
            url: ogUrl.toString(),
            width: 1200,
            height: 630,
            alt: `${nm}'s Base Wrapped 2025`,
          },
        ],
      },
      other: {
        "base:app_id": "693ec385d19763ca26ddc2cc",
        "fc:frame": JSON.stringify({
          version: minikitConfig.miniapp.version,
          imageUrl: ogUrl.toString(),
          button: {
            title: "Get Your Wrapped",
            action: {
              name: "launch_frame",
              type: "launch_frame",
            },
          },
        }),
      },
    };
  }

  // Default metadata
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      "base:app_id": "693ec385d19763ca26ddc2cc",
      "fc:frame": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: minikitConfig.miniapp.buttonTitle,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

export default function Home() {
  return <HomeClient />;
}
