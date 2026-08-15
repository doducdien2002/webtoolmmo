import { IconInbox } from './Icons';

export default function EmptyState({ title = 'Chưa có dữ liệu', desc = '', icon: Icon = IconInbox }) {
  return (
    <div className="empty-state">
      <Icon />
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );
}
