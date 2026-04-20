import Image from "next/image";
import Link from "next/link";

import { DesignIcon } from "@/components/shell/design-icons";
import { formatKzt } from "@/lib/format";
import type { ShowcaseOperator } from "@/lib/design-public";

export function PublicOperatorCard({ operator }: { operator: ShowcaseOperator }) {
  return (
    <article className="op-card" style={{ position: "relative" }}>
      <div className="op-photo">
        <Image alt="" fill sizes="(min-width: 1200px) 30vw, 100vw" src={operator.image} style={{ objectFit: "cover" }} />
        <div className="rating">
          <DesignIcon name="star" size={10} /> {operator.rating.toFixed(1)} · {operator.reviews}
        </div>
        <div className="verif">{operator.badge}</div>
      </div>
      <div className="op-body">
        <h3>{operator.companyName}</h3>
        <div className="city">{operator.addressLine}</div>
        <div className="license">{operator.licenseNumber}</div>
        <div className="tags">
          {operator.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="op-foot">
        <div className="price">
          <small>От</small>
          {formatKzt(operator.priceFrom)}
        </div>
        <div className="quota">
          свободно <b>{operator.quotaLeft} / {operator.quotaTotal}</b>
        </div>
      </div>
      <Link aria-label={operator.companyName} href={operator.href} style={{ position: "absolute", inset: 0 }}>
        <span className="sr-only">{operator.companyName}</span>
      </Link>
    </article>
  );
}
