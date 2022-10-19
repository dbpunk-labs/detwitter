import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import * as db3 from './db3';
import { keyring } from '@polkadot/ui-keyring';
import Account from './components/Account.component';
import Home from './components/Home.component';
import Register from './components/Register.component';
import Userhome from './components/UserHome.component';
import Authorization from './components/Authorization.component';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { allAccountAtom, ownerAddressAtom } from './state';

import './App.scss';

const { Header, Content, Footer } = Layout;

function App() {
    return (
        <div className='App'>
            {/* <Account /> */}
            <Layout className='layout' style={{ height: '100%', background:'#ffffff' }}>
                {/* <Header className='header'>
                    <div className='logo'>Dtwitter</div>
                    <Account />
                </Header> */}
                <Content style={{ padding: '20px 0' }}>
                    <Router>
                        <Routes>
                            <Route path='/' element={<Home />}></Route>
                            <Route path='/authorization' element={<Authorization />}></Route>
                            <Route path='/register' element={<Register />} />
                            <Route path='/user' element={<Userhome />} />
                        </Routes>
                    </Router>
                </Content>
                {/* <Footer style={{ textAlign: 'center' }}>合约地址</Footer> */}
            </Layout>
        </div>
    );
}

export default () => {
    const [ready, setReady] = useState(false);
    const setAllAccount = useSetRecoilState(allAccountAtom);
    const ownerAddress = useRecoilValue(ownerAddressAtom);
    useEffect(() => {
        if (ready && ownerAddress) {
               db3.setCurrentAccount(keyring.getPair(ownerAddress));
        }
    }, [ready, ownerAddress]);
    useEffect(() => {
        db3.init({
            appName: 'detwitter',
            node: import.meta.env.VITE_RPC,
        })
            .then(() => {
                db3.loadAccounts('detwitter');
            })
            .then(() => {
                //setAllAccount(data);
                //console.log(data);
                if (ownerAddress) {
                    db3.setCurrentAccount(keyring.getPair(ownerAddress));
                }
                setReady(true);
            });
    }, []);

    return (
        <Spin spinning={!ready} tip='Connecting to DB3' size='large' style={{ top: 130 }}>
            {ready && <App />}
        </Spin>
    );
};
