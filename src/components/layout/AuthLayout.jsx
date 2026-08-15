import { IconShield, IconHeadset, IconStar } from '../common/Icons';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'Sora',
              }}
            >
              TS
            </div>
            <div style={{ fontWeight: 800, fontFamily: 'Sora', fontSize: 17 }}>CHỢ TOOL MMO</div>
          </div>

          <h2 style={{ fontSize: 30, color: '#fff', marginTop: 60, lineHeight: 1.3, maxWidth: 380 }}>
            Giải pháp công nghệ đột phá &amp; toàn diện cho MMO
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 14, maxWidth: 380, lineHeight: 1.7, fontSize: 14.5 }}>
            Kho Tool MMO, Source Code chất lượng cao, ổn định cùng hệ thống quản lý key tự động, minh bạch.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          <Perk icon={IconShield} text="Bảo mật tuyệt đối, an toàn tối đa" />
          <Perk icon={IconHeadset} text="Hỗ trợ kỹ thuật tận tâm 24/7" />
          <Perk icon={IconStar} text="Tư vấn giải pháp tối ưu cho dự án" />
        </div>
      </div>

      <div className="auth-form-col">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

function Perk({ icon: Icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontSize: 13.5, fontWeight: 500 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 16, height: 16 }} />
      </div>
      {text}
    </div>
  );
}
