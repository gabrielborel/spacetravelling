import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();

  return (
    <>
      <Header />
      <AnimatePresence exitBeforeEnter>
        <Component {...pageProps} key={router.asPath} />
      </AnimatePresence>
    </>
  );
}

export default MyApp;
