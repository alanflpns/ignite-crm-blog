/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <section className={styles.header}>
        <Image src="/Logo.png" alt="logo" width="250px" height="30px" />
      </section>
    </Link>
  );
}
