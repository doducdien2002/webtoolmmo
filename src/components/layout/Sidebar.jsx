import { NavLink } from 'react-router-dom';

export default function Sidebar({ groups, brandSubtitle, collapsed, onNavigate }) {
  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand__mark">TS</div>
        <div className="sidebar-brand__text">
          ToolStore MMO
          <span>{brandSubtitle}</span>
        </div>
      </div>

      <nav className="sidebar-scroll">
        {groups.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <div className="sidebar-group__label">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
                onClick={onNavigate}
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}