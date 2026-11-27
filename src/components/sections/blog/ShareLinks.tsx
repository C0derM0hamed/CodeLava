import { MessageCircle, Share2 } from "lucide-react";
import { SocialIcon } from "@/components/ui/Icons";
import { CopyLinkButton } from "./CopyLinkButton";

export interface ShareLinksProps {
  url: string;
  title: string;
  labels: { share: string; copy: string; copied: string; openInNewTab: string };
}

const chip =
  "inline-flex h-10 items-center justify-center gap-2 rounded-pill border border-line-strong/80 bg-bg/60 px-3.5 text-xs font-semibold text-text shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,color,background-color,transform] duration-200 hover:-translate-y-px hover:border-line-lava-strong hover:bg-surface hover:text-accent-text hover:shadow-card motion-reduce:hover:translate-y-0";

export function ShareLinks({ url, title, labels }: ShareLinksProps) {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const targets = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: <SocialIcon network="linkedin" size={14} />,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${text}`,
      icon: <SocialIcon network="x" size={13} />,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${text}%20${u}`,
      icon: <MessageCircle aria-hidden="true" className="size-3.5" />,
    },
  ];
  return (
    <div>
      <p className="mb-3.5 inline-flex items-center gap-2 text-sm font-semibold text-text">
        <Share2 aria-hidden="true" className="size-4 text-accent-text" />
        <span>{labels.share}</span>
      </p>
      <ul className="grid grid-cols-2 gap-2">
        {targets.map((target) => (
          <li key={target.name}>
            <a
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${target.name} (${labels.openInNewTab})`}
              data-cursor="pointer"
              className={`${chip} w-full`}
            >
              {target.icon}
              <span dir="ltr">{target.name}</span>
            </a>
          </li>
        ))}
        <li>
          <CopyLinkButton url={url} copyLabel={labels.copy} copiedLabel={labels.copied} className={`${chip} w-full`} />
        </li>
      </ul>
    </div>
  );
}
