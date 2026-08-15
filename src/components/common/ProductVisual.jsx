import { IconBox, IconCode, IconSparkles, IconTerminal } from './Icons';

const LOOKS = {
  facebook: { label: 'MULTI PROFILE', accent: 'blue', Icon: IconCode },
  tiktok: { label: 'AUTO WORKFLOW', accent: 'violet', Icon: IconSparkles },
  instagram: { label: 'ENGAGEMENT', accent: 'pink', Icon: IconSparkles },
  telegram: { label: 'MESSAGING API', accent: 'cyan', Icon: IconTerminal },
  email: { label: 'DATA CLEANUP', accent: 'orange', Icon: IconTerminal },
  ai: { label: 'AI CREATIVE', accent: 'mint', Icon: IconSparkles },
};

export default function ProductVisual({ product, large = false }) {
  const look = LOOKS[product.category] || { label: 'DIGITAL TOOL', accent: 'blue', Icon: IconBox };
  const Icon = look.Icon;
  return <div className={`product-visual product-visual--${look.accent} ${large ? 'product-visual--large' : ''}`}>
    <div className="product-visual__glow" />
    <div className="product-visual__app">
      <div className="product-visual__bar"><span /><span /><span /><b>{look.label}</b></div>
      <div className="product-visual__content"><div className="product-visual__symbol"><Icon /></div><div className="product-visual__lines"><i /><i /><i /></div><div className="product-visual__chart"><i /><i /><i /><i /><i /></div></div>
    </div>
   
  </div>;
}
