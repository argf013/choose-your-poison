import React from "react";
import { ReceiptData } from "../../types";
import { SIDE_DISH_COPY, socialLogoDataUrl } from "../../data/receiptCopy";

interface ThermalReceiptProps {
  receipt: ReceiptData;
  isPrintVersion?: boolean;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  receipt,
  isPrintVersion = false,
}) => {
  // Realistic authentic barcode bars based on checksum
  const barcodeBars = React.useMemo(() => {
    const bars: { width: number; isBlack: boolean }[] = [];
    const seed = receipt.checksum + receipt.sessionId;
    // Start guard bars
    bars.push(
      { width: 2, isBlack: true },
      { width: 1, isBlack: false },
      { width: 1, isBlack: true }
    );

    for (let i = 0; i < seed.length; i++) {
      const code = seed.charCodeAt(i);
      bars.push({ width: (code % 2) + 1, isBlack: false });
      bars.push({ width: ((code >> 1) % 3) + 1, isBlack: true });
      bars.push({ width: ((code >> 2) % 2) + 1, isBlack: false });
      bars.push({ width: (code % 3) + 1, isBlack: true });
    }

    // End guard bars
    bars.push(
      { width: 1, isBlack: true },
      { width: 1, isBlack: false },
      { width: 2, isBlack: true }
    );
    return bars;
  }, [receipt.checksum, receipt.sessionId]);

  const widthClass = receipt.paperWidth === "80mm" ? "max-w-[340px]" : "max-w-[300px]";

  return (
    <div
      className={`receipt-container font-mono-receipt text-black leading-tight select-text text-left ${
        isPrintVersion
          ? "w-full max-w-[76mm] p-4 bg-white text-black"
          : `${widthClass} w-full bg-white p-6 sm:p-7 shadow-receipt rounded-sm border border-[#E8E4DA] relative receipt-sawtooth-top receipt-sawtooth-bottom transition-all duration-300`
      }`}
    >
      {/* Receipt Header */}
      <div className="text-center pb-2">
        <h1 className="text-lg sm:text-xl font-bold tracking-wider mt-1 mb-0.5 text-black">
          YOUR POISON
        </h1>
        <p className="text-[9px] tracking-widest text-neutral-600 uppercase">
          FREEDOM OF EXPRESSION TERMINAL
        </p>
      </div>

      <div className="border-t-2 border-dashed border-black/30 my-3" />

      <div className="text-[11px] space-y-1 py-0.5 font-mono">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500">SESSION:</span>
          <span className="font-bold tracking-wider">{receipt.sessionId}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-neutral-500">DATE:</span>
          <span className="font-medium">{receipt.timestamp}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black/25 my-3" />

      {/* Main Course */}
      <div className="text-center">
        <div className="text-xs font-bold tracking-widest uppercase mb-2">Main Course</div>
        {(receipt.selectedSocials || []).length === 0 && (
          <div className="text-xs text-neutral-500">-</div>
        )}
        <div className="flex flex-row flex-wrap items-center justify-center gap-3">
          {(receipt.selectedSocials || []).map((id) => {
            const logo = socialLogoDataUrl(id, 96);
            return logo ? (
              <img key={id} src={logo} alt={id} title={id} className="w-6 h-6" />
            ) : (
              <span key={id} className="text-[10px] font-bold uppercase">
                {id}
              </span>
            );
          })}
        </div>
      </div>

      <div className="border-t border-dashed border-black/25 my-3" />

      {/* Side Dishes */}
      <div>
        <div className="text-center text-xs font-bold tracking-widest uppercase mb-2">
          Side Dishes
        </div>
        {receipt.selectedExpressions.length === 0 ? (
          <div className="text-xs text-neutral-500 text-center">-</div>
        ) : (
          <div className="space-y-3">
            {receipt.selectedExpressions.map((item) => {
              const copy = SIDE_DISH_COPY[item.id] || {
                title: item.title,
                why: item.consequenceQuote,
              };
              const inputs = receipt.expressionInputs || {};
              const id = inputs.identity;
              return (
                <div key={item.id} className="text-[10px] leading-snug">
                  <div className="text-[11px] font-bold">{copy.title}</div>
                  {item.id === "share-face" && inputs.facePhoto && (
                    <img
                      src={inputs.facePhoto}
                      alt="Captured face"
                      className="w-full h-auto object-cover grayscale contrast-125 border border-black/30 my-1"
                    />
                  )}
                  {item.id === "speak-mind" && inputs.mindText && <div>&ldquo;{inputs.mindText}&rdquo;</div>}
                  {item.id === "share-location" && inputs.locationText && <div>{inputs.locationText}</div>}
                  {item.id === "share-life" && inputs.lifeText && <div>&ldquo;{inputs.lifeText}&rdquo;</div>}
                  {item.id === "share-identity" && id && (
                    <div>
                      {id.name && <div>Name: {id.name}</div>}
                      {id.birthPlaceDate && <div>DOB: {id.birthPlaceDate}</div>}
                      {id.address && <div>Address: {id.address}</div>}
                      {id.school && <div>School: {id.school}</div>}
                      {id.graduation && <div>Graduation: {id.graduation}</div>}
                    </div>
                  )}
                  <div className="text-neutral-600 mt-0.5">{copy.why}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t-2 border-dashed border-black/30 my-3" />

      <div className="text-center py-1 space-y-0.5">
        <div className="font-bold text-xs tracking-wider text-black">THANK YOU FOR YOUR ORDER</div>
        <div className="font-bold text-xs tracking-wider text-black">ENJOY YOUR POISON</div>
      </div>

      {/* Barcode Section */}
      <div className="my-3 flex flex-col items-center">
        <div className="h-9 w-full flex items-stretch justify-center gap-[1.5px] px-2 overflow-hidden bg-white">
          {barcodeBars.map((bar, i) => (
            <div
              key={i}
              style={{ width: `${bar.width * 1.5}px` }}
              className={`h-full ${bar.isBlack ? "bg-black" : "bg-transparent"}`}
            />
          ))}
        </div>
        <div className="text-[9px] tracking-[0.25em] text-neutral-600 mt-1.5 font-mono">
          *{receipt.checksum}*
        </div>
      </div>
    </div>
  );
};
