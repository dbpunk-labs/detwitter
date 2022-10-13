import React, { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Authorization from './Authorization.component';

const Home: React.FC<{}> = memo(props => {
    const navigate = useNavigate();
    useEffect(() => {
        const isAuthorization = localStorage.getItem('dtwitter_isAuthorization');
        const isRegister = localStorage.getItem('dtwitter_isRegister');
        if (isAuthorization && isRegister) {
            navigate('/user');
        } else if (isAuthorization && !isRegister) {
            navigate('/register');
        }
    }, []);
    return (
        <div className='dtwitter-home'>
            <Authorization />
        </div>
    );
});
export default Home;
