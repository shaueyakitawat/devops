import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../lib/auth';
import styles from '../styles/components/sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  const user = getCurrentUser();

  return (
    <div className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.submenu}>
          <Link className={location.pathname === "/resources" ? styles.active : null} to="/resources">Documentation</Link>
          <Link className={location.pathname === "/market" ? styles.active : null} to="/market">Market Hub</Link>
          <Link className={location.pathname === "/news-insights" ? styles.active : null} to="/news-insights">News Insights</Link>
          <Link className={location.pathname === "/portfolio" ? styles.active : null} to="/portfolio">Portfolio</Link>
          <Link className={location.pathname === "/ai-analyzer" ? styles.active : null} to="/ai-analyzer">AI Analyzer</Link>
          <button onClick={logout} className={styles.logoutBtn}>Account</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
