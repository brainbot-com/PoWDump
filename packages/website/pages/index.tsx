import type { NextPage } from 'next'
import { CommitBox } from "../components/commit-box";

import { useStore } from "../store";
import Layout from "../components/layout";

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
        <CommitBox />
    </Layout>

  )
}

export default Home
