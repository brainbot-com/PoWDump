import type { NextPage } from 'next'

import { useStore } from "../store";
import Layout from "../components/layout";
import {DumpBox} from "../components/dump-box";

const Home: NextPage = () => {
  const activeNavBarSwitchItem = useStore(
      (state) => state.activeNavBarSwitchItem
  );
  const setActiveNavBarSwitchItem = useStore(
      (state) => state.setActiveNavBarSwitchItem
  );
  const setActiveCommitBoxSwitchItem = useStore(
      (state) => state.setActiveCommitBoxSwitchItem
  );

  return (
    <Layout title={'Create Next App'}>
        <DumpBox />
    </Layout>

  )
}

export default Home
