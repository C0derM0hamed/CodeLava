import { Share2 } from "lucide-react";
import { CopyLinkButton } from "./CopyLinkButton";

export interface ShareLinksProps {
  url: string;
  title: string;
  labels: { share: string; copy: string; copied: string; openInNewTab: string };
}

const chip =
  "inline-flex h-10 items-center rounded-pill border border-line bg-surface px-4 text-sm font-medium text-text shadow-xs transition-[border-color,box-shadow,color] hover:border-line-lava-strong hover:text-accent-text hover:shadow-card";

export function ShareLinks({ url, title, labels }: ShareLinksProps) {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const targets = [
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${text}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${text}%20${u}` },
  ];
  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-text">
        <Share2 aria-hidden="true" className="size-4 text-accent-text" />
        {labels.share}
      </p>
      <ul className="flex flex-wrap gap-2">
        {targets.map((target) => (
          <li key={target.name}>
            <a
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${target.name} (${labels.openInNewTab})`}
              data-cursor="pointer"
              className={chip}
            >
              <span dir="ltr">{target.name}</span>
            </a>
          </li>
        ))}
        <li>
          <CopyLinkButton url={url} copyLabel={labels.copy} copiedLabel={labels.copied} className={chip} />
        </li>
      </ul>
    </div>
  );
}
