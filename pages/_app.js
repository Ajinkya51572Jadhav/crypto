import React from 'react';
import { wrapper } from '../store/store';
import 'antd/dist/reset.css';
import '../app/globals.css';
import { Layout } from 'antd';

function MyApp({ Component, pageProps }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Layout.Content style={{ padding: 24 }}>
          <Component {...pageProps} />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default wrapper.withRedux(MyApp);