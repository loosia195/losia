"use client";

export default function InfoBlocks({ sizeLabel, condition, conditionDescription, details, itemNumber, }: { sizeLabel: string; condition?: string; conditionDescription?: string; details?: string[]; itemNumber?: string; }) {
  const list = Array.isArray(details) && details.length > 0 ? details : [
    condition ? `Condition: ${condition}` : undefined,
    conditionDescription ? `Description: ${conditionDescription}` : undefined,
  ].filter(Boolean) as string[];

  return (
    <div className="u-flex u-flex-col u-gap-2x">
      <section>
        <h2 className="heading-sm-bold u-mb-1x">Size & fit</h2>
        <div className="body-copy">Size {sizeLabel}</div>
      </section>

      <section>
        <h2 className="heading-sm-bold u-mb-1x">Item details {itemNumber && <span className="u-text-gray-6">#{itemNumber}</span>}</h2>
        {list.length ? (
          <ul className="u-flex u-flex-col u-gap-1xs">
            {list.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        ) : (
          <div className="u-text-gray-6">No additional details.</div>
        )}
      </section>
    </div>
  );
}