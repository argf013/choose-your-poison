import React from "react";
import { ReceiptData } from "../../types";

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
        <h1 className="text-base sm:text-lg font-bold tracking-wider mt-1 mb-0.5 text-black">
          CHOOSE YOUR POISON
        </h1>
        <p className="text-[9px] tracking-widest text-neutral-600 uppercase">
          FREEDOM OF EXPRESSION TERMINAL
        </p>
      </div>

      {/* Double line divider */}
      <div className="border-t-2 border-dashed border-black/30 my-3" />

      {/* Session Metadata Table */}
      <div className="text-[11px] space-y-1 py-0.5 font-mono">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500">SESSION:</span>
          <span className="font-bold tracking-wider">{receipt.sessionId}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-neutral-500">TIMESTAMP:</span>
          <span className="font-medium">{receipt.timestamp}</span>
        </div>
        {receipt.selectedSocials && receipt.selectedSocials.length > 0 && (
          <div className="flex justify-between items-start text-[10px] gap-2">
            <span className="text-neutral-500 shrink-0">PLATFORMS:</span>
            <span className="font-medium text-right">{receipt.selectedSocials.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-black/25 my-3" />

      {/* Selected Expressions List */}
      <div className="py-0.5">
        <div className="text-[10px] tracking-wider font-bold uppercase text-neutral-600 mb-2.5">
          RECORDED EXPRESSIONS &amp; RISKS:
        </div>

        {receipt.selectedExpressions.length === 0 ? (
          <div className="text-xs italic text-neutral-500 py-2 text-center">
            [ No expressions selected ]
          </div>
        ) : (
          <div className="space-y-3">
            {receipt.selectedExpressions.map((item) => (
              <div key={item.id} className="receipt-section-item text-[11px]">
                <div className="font-bold flex justify-between text-black">
                  <span>
                    [{item.code}] {item.title}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-700 pl-3 mt-0.5">
                  &gt; Risk: <span className="font-semibold">{item.primaryRisk}</span>
                </div>

                {/* Captured User Input */}
                {item.id === "share-face" && receipt.expressionInputs?.facePhoto && (
                  <div className="mt-2">
                    <img
                      src={receipt.expressionInputs.facePhoto}
                      alt="Captured face"
                      className="w-full h-auto object-cover grayscale contrast-125 border border-black/30"
                    />
                  </div>
                )}
                {item.id === "speak-mind" && receipt.expressionInputs?.mindText && (
                  <div className="text-[10px] text-black pl-3 mt-1 border-l-2 border-black/30 ml-3">
                    &ldquo;{receipt.expressionInputs.mindText}&rdquo;
                  </div>
                )}
                {item.id === "share-location" && receipt.expressionInputs?.locationText && (
                  <div className="text-[10px] text-black pl-3 mt-0.5 font-mono">
                    &gt; Loc: {receipt.expressionInputs.locationText}
                  </div>
                )}
                {item.id === "share-life" && receipt.expressionInputs?.lifeText && (
                  <div className="text-[10px] text-black pl-3 mt-1 border-l-2 border-black/30 ml-3">
                    &ldquo;{receipt.expressionInputs.lifeText}&rdquo;
                  </div>
                )}
                {item.id === "share-identity" && receipt.expressionInputs?.identity && (
                  <div className="text-[9px] text-black pl-3 mt-1 space-y-0.5">
                    {receipt.expressionInputs.identity.name && (
                      <div>&gt; Name: {receipt.expressionInputs.identity.name}</div>
                    )}
                    {receipt.expressionInputs.identity.birthPlaceDate && (
                      <div>&gt; DOB: {receipt.expressionInputs.identity.birthPlaceDate}</div>
                    )}
                    {receipt.expressionInputs.identity.address && (
                      <div>&gt; Addr: {receipt.expressionInputs.identity.address}</div>
                    )}
                    {receipt.expressionInputs.identity.school && (
                      <div>&gt; School: {receipt.expressionInputs.identity.school}</div>
                    )}
                    {receipt.expressionInputs.identity.graduation && (
                      <div>&gt; Grad: {receipt.expressionInputs.identity.graduation}</div>
                    )}
                  </div>
                )}

                <div className="text-[9px] text-neutral-500 italic pl-3 mt-0.5 leading-snug">
                  &ldquo;{item.consequenceQuote}&rdquo;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-black/25 my-3" />

      {/* The Hidden Cost Section */}
      <div className="text-[10px] py-0.5 text-neutral-700 space-y-1">
        <div className="font-bold text-black uppercase text-[10px] tracking-wider">
          THE HIDDEN COST:
        </div>
        <div className="pl-1 space-y-0.5 text-[10px]">
          <div>• Your biometric and facial geometry</div>
          <div>• Your permanent digital footprint</div>
          <div>• Your private contextual boundaries</div>
          <div>• Your perpetual surveillance record</div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-black/30 my-3" />

      {/* Philosophy Closing Paradox */}
      <div className="text-center py-1.5 space-y-1">
        <div className="font-bold text-xs tracking-wider text-black">YOU CHOSE YOUR POISON.</div>
        <p className="text-[10px] text-neutral-600 leading-tight">
          You knew the risks.
          <br />
          You made the choice.
        </p>
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

      {/* Final Divider */}
      <div className="border-t border-dashed border-black/25 my-3" />

      {/* Footer Acknowledgement */}
      <div className="text-center pt-0.5 text-[9px] text-neutral-600 space-y-0.5">
        <div className="font-bold text-black tracking-wider">THANK YOU FOR YOUR EXPRESSION.</div>
        <div className="text-[8px] text-neutral-400">KEEP THIS PHYSICAL RECORD AS PROOF</div>
      </div>
    </div>
  );
};
