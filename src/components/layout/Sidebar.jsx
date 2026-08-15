import { NavLink } from 'react-router-dom';

/**
 * Sidebar dùng chung cho cả khu vực User và Admin.
 * @param {Array<{label:string, items:Array<{to:string, label:string, icon:Component}>}>} groups
 */
export default function Sidebar({ groups, brandSubtitle, collapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand__mark">TS</div>
        <div className="sidebar-brand__text">
          DUC DIEN TOOL
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
