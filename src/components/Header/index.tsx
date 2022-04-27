import Link from 'next/link';
import styles from './header.module.scss';

const Header = (): JSX.Element => {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="/images/logo.svg" width="240px" height="30px" alt="logo" />
        </a>
      </Link>
    </header>
  );
};

export default Header;
