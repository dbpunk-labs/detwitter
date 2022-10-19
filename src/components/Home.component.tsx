import React, { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ownerAddressAtom } from '../state';
import Authorization from './Authorization.component';
import GeneratorAccount from './GeneratorAccount.component';

const Home: React.FC<{}> = memo(props => {
    const navigate = useNavigate();
    const ownerAddress = useRecoilValue(ownerAddressAtom);
    useEffect(() => {
        const isRegister = localStorage.getItem('dtwitter_isRegister');
        if (ownerAddress && isRegister) {
            navigate('/user');
            return;
        }
        if (ownerAddress && !isRegister) {
            navigate('/authorization');
            return;
        }
    }, []);
    return (
        <div className='dtwitter-home'>
            <GeneratorAccount />
        </div>
    );
});
export default Home;
