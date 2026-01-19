import React, { useRef } from 'react';
import { Zap, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ServiceLevel = 'STANDARD' | 'EXPRESS' | 'PRIORITY';
export type TransportMode = 'AIR' | 'TRUCK';

export interface LabelData {
  awb: string;
  transportMode: TransportMode;
  serviceLevel: ServiceLevel;
  serviceName: string;
  serviceCode: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  paymentMode: string;
  recipient: {
    name: string;
    address: string;
    city: string;
    state?: string;
  };
  routing: {
    origin: string;
    destination: string;
    deliveryStation: string;
    originSort: string;
    destSort: string;
  };
  dates: {
    shipDate: string;
    invoiceDate: string;
  };
  gstNumber?: string;
}

interface LabelGeneratorProps {
  data: LabelData;
  onPrint?: () => void;
}

const TransportIcon: React.FC<{ mode: TransportMode; className?: string }> = ({ mode, className = "w-20 h-20" }) => {
  if (mode === 'AIR') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={className} fill="currentColor">
        <path d="M480 192H365.71L260.61 8.06A16.014 16.014 0 0 0 246.71 0h-65.5c-10.63 0-18.3 10.17-15.38 20.39L214.86 192H112l-43.2-57.6c-3.02-4.03-7.77-6.4-12.8-6.4H16.01C5.6 128-2.04 137.78.49 147.88L32 256L.49 364.12C-2.04 374.22 5.6 384 16.01 384H56c5.04 0 9.78-2.37 12.8-6.4L112 320h102.86l-49.03 171.6c-2.92 10.22 4.75 20.4 15.38 20.4h65.5c5.74 0 11.04-3.08 13.89-8.06L365.71 320H480c35.35 0 96-28.65 96-64s-60.65-64-96-64z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 13.5L2.25 12H7.5l-.6-1.5H2L1.25 9h7.8l-.6-1.5H1.11L.25 6H4a2 2 0 0 1 2-2h12v4h3l3 4v5h-2a3 3 0 0 1-3 3a3 3 0 0 1-3-3h-4a3 3 0 0 1-3 3a3 3 0 0 1-3-3H4v-3.5H3m16 5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5m1.5-9H18V12h4.46L20.5 9.5M9 18.5a1.5 1.5 0 0 0 1.5-1.5A1.5 1.5 0 0 0 9 15.5A1.5 1.5 0 0 0 7.5 17A1.5 1.5 0 0 0 9 18.5Z" />
    </svg>
  );
};

const ServiceLevelIcon: React.FC<{ level: ServiceLevel; className?: string }> = ({ level, className = "w-4 h-4" }) => {
  switch (level) {
    case 'PRIORITY':
      return <Star className={className} />;
    case 'EXPRESS':
      return <Zap className={className} />;
    case 'STANDARD':
    default:
      return <Clock className={className} />;
  }
};

const getServiceLevelLabel = (level: ServiceLevel): string => {
  switch (level) {
    case 'PRIORITY':
      return 'PRIORITY';
    case 'EXPRESS':
      return 'EXPRESS';
    case 'STANDARD':
    default:
      return 'STANDARD';
  }
};

export const LabelGenerator: React.FC<LabelGeneratorProps> = ({ data, onPrint }) => {
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Print Controls */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint} variant="default">
          Print Label
        </Button>
      </div>

      {/* Label */}
      <div ref={labelRef} className="label-container w-full flex justify-center p-0">
        <style>{`
          .label-container {
            padding: 0;
            background: transparent;
          }

          @media print {
            body * {
              visibility: hidden;
            }
            .label-container, .label-container * {
              visibility: visible;
            }
            .label-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }

          .label {
            width: 740px;
            max-width: 100%;
            min-height: 1050px;
            margin: 0 auto;
            background: white;
            border: 3px solid #111;
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            display: flex;
            flex-direction: column;
          }

          .section {
            border-bottom: 2px solid #111;
          }

          .section:last-child {
            border-bottom: 0;
          }

          .grid {
            display: grid;
            width: 100%;
          }

          .split-2 {
            grid-template-columns: 2fr 1fr;
          }

          .cols-3 {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .kicker {
            margin: 0 0 10px 0;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .header {
            min-height: 220px;
          }

          .header-left {
            padding: 18px;
            border-right: 2px solid #111;
          }

          .service-name {
            margin: 0 0 14px 0;
            font-weight: 900;
            font-size: 20px;
            letter-spacing: 2px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .barcode-wrap {
            border: 2px solid #111;
            padding: 12px;
            margin-bottom: 14px;
            height: 96px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .barcode {
            width: 100%;
            height: 56px;
            background: repeating-linear-gradient(
              90deg,
              #111 0px, #111 3px,
              transparent 3px, transparent 6px,
              #111 6px, #111 7px,
              transparent 7px, transparent 10px,
              #111 10px, #111 14px,
              transparent 14px, transparent 16px
            );
          }

          .tracking {
            margin: 0;
            font-size: 44px;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .header-right {
            display: grid;
            grid-template-rows: 1fr auto;
            min-height: 220px;
          }

          .header-right-top {
            display: grid;
            grid-template-rows: 1fr 92px;
          }

          .icon-box {
            border-bottom: 2px solid #111;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
          }

          .icon-box svg {
            width: 92px;
            height: 92px;
            color: #111;
          }

          .meta-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 92px;
          }

          .meta {
            border-right: 2px solid #111;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            text-transform: uppercase;
            font-weight: 900;
          }

          .meta:last-child {
            border-right: 0;
          }

          .weight {
            flex-direction: column;
            gap: 4px;
          }

          .weight strong {
            font-size: 30px;
            line-height: 1;
          }

          .weight span {
            font-size: 16px;
            font-weight: 900;
            text-transform: lowercase;
          }

          .meta-code {
            font-size: 28px;
            letter-spacing: 1px;
          }

          .paybar {
            border-top: 2px solid #111;
            text-align: center;
            font-weight: 900;
            letter-spacing: 2px;
            font-size: 22px;
            text-transform: uppercase;
            padding: 10px 0;
          }

          .shipto {
            padding: 18px;
          }

          .recipient {
            margin: 0 0 10px 0;
            font-size: 62px;
            font-weight: 900;
            line-height: 0.95;
            text-transform: uppercase;
          }

          .address {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            line-height: 1.35;
          }

          .hub {
            min-height: 182px;
          }

          .hub > .cell {
            padding: 16px;
            border-right: 2px solid #111;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 10px;
          }

          .hub > .cell:last-child {
            border-right: 0;
          }

          .hub-code {
            margin: 0;
            font-size: 72px;
            font-weight: 900;
            text-transform: uppercase;
            line-height: 1;
            letter-spacing: 1px;
          }

          .dates {
            min-height: 98px;
          }

          .dates > .cell {
            padding: 14px 16px;
            border-right: 2px solid #111;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8px;
          }

          .dates > .cell:last-child {
            border-right: 0;
          }

          .value {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
          }

          .gst {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 18px;
            letter-spacing: 0.4px;
          }

          .route {
            min-height: 128px;
          }

          .route-left {
            padding: 16px;
            border-right: 2px solid #111;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 12px;
          }

          .route-value {
            margin: 0;
            font-size: 56px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .route-right {
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 12px;
          }

          .service-box {
            border: 2px solid #111;
            padding: 14px;
            text-align: center;
            font-weight: 900;
            font-size: 30px;
            width: min(180px, 100%);
          }

          .brand {
            min-height: 110px;
            padding: 16px 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-top: auto;
          }

          .brand-badge {
            width: 58px;
            height: 58px;
            border: 3px solid #111;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 28px;
            line-height: 1;
          }

          .brand-name {
            margin: 0;
            font-size: 44px;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .brand-line {
            height: 4px;
            width: 260px;
            background: #111;
            margin-top: 6px;
          }
        `}</style>

        <main className="label">
          {/* HEADER */}
          <section className="section grid split-2 header">
            {/* LEFT */}
            <div className="header-left">
              <p className="service-name">
                <ServiceLevelIcon level={data.serviceLevel} className="w-5 h-5" />
                {data.serviceName}
              </p>

              <div className="barcode-wrap">
                <div className="barcode"></div>
              </div>

              <p className="tracking">{data.awb}</p>
            </div>

            {/* RIGHT */}
            <div className="header-right">
              <div className="header-right-top">
                {/* TRANSPORT ICON */}
                <div className="icon-box">
                  <TransportIcon mode={data.transportMode} />
                </div>

                {/* WEIGHT + CODE */}
                <div className="meta-row">
                  <div className="meta weight">
                    <strong>{Number(data.weight || 0).toFixed(2)}</strong>
                    <span>{data.weightUnit}</span>
                  </div>

                  <div className="meta meta-code">{data.serviceCode}</div>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="paybar">{data.paymentMode}</div>
            </div>
          </section>

          {/* SHIP TO */}
          <section className="section shipto">
            <p className="kicker">SHIP TO</p>
            <h1 className="recipient">{data.recipient.name}</h1>

            <p className="address">
              {data.recipient.address}<br />
              {data.recipient.city}
              {data.recipient.state && <><br />{data.recipient.state}</>}
            </p>
          </section>

          {/* HUB INFO */}
          <section className="section grid cols-3 hub">
            <div className="cell">
              <p className="kicker">DELIVERY STATION</p>
              <p className="hub-code">{data.routing.deliveryStation}</p>
            </div>

            <div className="cell">
              <p className="kicker">ORIGIN SORT</p>
              <p className="hub-code">{data.routing.originSort}</p>
            </div>

            <div className="cell">
              <p className="kicker">DEST SORT</p>
              <p className="hub-code">{data.routing.destSort}</p>
            </div>
          </section>

          {/* DATES */}
          <section className="section grid cols-3 dates">
            <div className="cell">
              <p className="kicker">SHIP DATE</p>
              <p className="value">{data.dates.shipDate}</p>
            </div>

            <div className="cell">
              <p className="kicker">GST NUMBER</p>
              <p className="value gst">{data.gstNumber || 'N/A'}</p>
            </div>

            <div className="cell">
              <p className="kicker">INVOICE DATE</p>
              <p className="value">{data.dates.invoiceDate}</p>
            </div>
          </section>

          {/* ROUTING */}
          <section className="section grid split-2 route">
            <div className="route-left">
              <p className="kicker">ROUTING</p>
              <p className="route-value">{data.routing.origin} → {data.routing.destination}</p>
            </div>

            <div className="route-right">
              <p className="kicker">SERVICE LEVEL</p>
              <div className="service-box">{getServiceLevelLabel(data.serviceLevel)}</div>
            </div>
          </section>

          {/* BRAND */}
          <footer className="brand">
            <div className="brand-badge">T</div>

            <div>
              <p className="brand-name">TAC Shipping</p>
              <div className="brand-line"></div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default LabelGenerator;
